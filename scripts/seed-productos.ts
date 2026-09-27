/**
 * Ingesta del catálogo de productos desde las carpetas locales hacia Supabase.
 *
 * Uso:  npm run seed
 *
 * Fuentes de datos (decisión tomada en la auditoría de fase 1 — ver el
 * resumen entregado al usuario): se ingesta SOLO desde `embutidos/` y
 * `Pollo_Sofia_25_productos_4K/`, que traen fichas estructuradas con datos
 * reales (precio, código, categoría). Los 50 archivos sueltos numerados en
 * la raíz del proyecto (01_..._ a 26_..._) son un borrador anterior
 * superado por `embutidos/` y se dejan intactos, sin ingerir.
 *
 * Reejecutable: usa upsert por SKU, así que correrlo de nuevo tras agregar
 * más productos a estas carpetas actualiza los existentes sin duplicarlos.
 *
 * Autenticación: como las políticas RLS solo permiten escribir en
 * productos/categorias_producto/Storage al rol admin, el script inicia
 * sesión con la cuenta de prueba admin@gmail.com (ver USUARIOS_PRUEBA.md).
 * Para producción, cambiar las variables de entorno SEED_ADMIN_EMAIL /
 * SEED_ADMIN_PASSWORD por credenciales reales de un admin.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Las fotos originales pesan hasta ~4 MB (2000–3840 px PNG) y se muestran en
// tarjetas de ~320 px: se suben como WebP de 900 px (≈40–90 KB), suficiente
// también para la ficha de producto en pantallas retina.
const ANCHO_IMAGEN = 900;
const CALIDAD_WEBP = 80;

const SUPABASE_URL = 'https://hcbamtodpebrjlpaeeai.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_kVh0HCXu_dJMEZemKYlGog_R5GKMyQP';

const ADMIN_EMAIL = process.env['SEED_ADMIN_EMAIL'] ?? 'admin@gmail.com';
const ADMIN_PASSWORD = process.env['SEED_ADMIN_PASSWORD'] ?? 'LaCerda2026!Admin';

// Carpetas de categoría a ingerir — lista explícita, no un escaneo ciego de
// la raíz, para no arrastrar los 50 archivos sueltos redundantes ni carpetas
// del proyecto (node_modules, src, public, .git, etc.).
const CARPETAS_CATEGORIA = ['embutidos', 'Pollo_Sofia_25_productos_4K'];

const PROJECT_ROOT = join(import.meta.dirname, '..');

type Ficha = Record<string, string>;

interface ProductoPendiente {
  sku: string;
  nombre: string;
  motivo: string;
}

const pendientes: ProductoPendiente[] = [];

function parseFicha(texto: string): Ficha {
  const lineas = texto.replace(/^﻿/, '').split(/\r?\n/);
  const campos: Ficha = {};
  let claveActual: string | null = null;

  for (const raw of lineas) {
    const linea = raw.trim();
    if (!linea) {
      claveActual = null;
      continue;
    }
    const m = linea.match(/^([A-Za-zÁÉÍÓÚÑñáéíóú0-9/ ]{2,55}?):\s*(.*)$/);
    if (m) {
      claveActual = m[1].trim();
      campos[claveActual] = campos[claveActual] ? `${campos[claveActual]} ${m[2].trim()}` : m[2].trim();
    } else if (claveActual) {
      campos[claveActual] += ` ${linea}`;
    }
  }
  return campos;
}

function primerCampo(campos: Ficha, claves: string[]): string | undefined {
  for (const clave of claves) {
    if (campos[clave]) return campos[clave].trim();
  }
  return undefined;
}

/** Extrae el primer monto "Bs X,XX" de una línea de precio y lo devuelve en formato numérico (punto decimal). */
function parsearPrecio(lineaPrecio: string | undefined): number | null {
  if (!lineaPrecio) return null;
  const m = lineaPrecio.match(/Bs\s*([\d.]+(?:,\d+)?)/);
  if (!m) return null;
  return Number(m[1].replace(/\./g, '').replace(',', '.'));
}

/** Extrae peso (en kg) de la línea de presentación, si hay un patrón "N kg" o "N g" reconocible. */
function parsearPesoKg(presentacion: string | undefined): number | null {
  if (!presentacion) return null;
  const m = presentacion.match(/(\d+(?:[.,]\d+)?)\s*(kg|g)\b/i);
  if (!m) return null;
  const valor = Number(m[1].replace(',', '.'));
  return m[2].toLowerCase() === 'kg' ? valor : valor / 1000;
}

function unidadMedida(presentacion: string | undefined): 'kg' | 'unidad' | 'paquete' {
  if (!presentacion) return 'paquete';
  if (/\bunidad(es)?\b/i.test(presentacion) && !/\bkg\b|\bg\b/i.test(presentacion)) return 'paquete';
  if (/\bkg\b|\bg\b/i.test(presentacion)) return 'kg';
  return 'paquete';
}

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function prefijoSku(categoria: string): string {
  const letras = categoria
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
  return letras.slice(0, 3) || 'GEN';
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  if (authError) {
    console.error('No se pudo iniciar sesión como admin:', authError.message);
    process.exit(1);
  }
  console.log(`Autenticado como ${ADMIN_EMAIL}.`);

  const categoriaIdCache = new Map<string, string>();
  let totalCreados = 0;
  let totalActualizados = 0;

  for (const carpeta of CARPETAS_CATEGORIA) {
    const dirPath = join(PROJECT_ROOT, carpeta);
    if (!statSync(dirPath, { throwIfNoEntry: false })?.isDirectory()) {
      console.warn(`Carpeta no encontrada, se omite: ${carpeta}`);
      continue;
    }

    const archivos = readdirSync(dirPath);
    const bases = new Set(
      archivos
        .filter((f) => f.toLowerCase().endsWith('.txt') && f.toLowerCase() !== 'resumen.txt')
        .map((f) => f.replace(/\.txt$/i, '')),
    );

    console.log(`\n📂 ${carpeta}: ${bases.size} fichas de producto encontradas.`);

    for (const base of bases) {
      const txtPath = join(dirPath, `${base}.txt`);
      const imagenNombre = ['.png', '.jpg', '.jpeg'].map((ext) => `${base}${ext}`).find((n) => archivos.includes(n));

      if (!imagenNombre) {
        pendientes.push({ sku: base, nombre: base, motivo: 'Sin imagen emparejada — no se creó el producto.' });
        continue;
      }

      const texto = readFileSync(txtPath, 'utf-8');
      const campos = parseFicha(texto);

      const nombre = campos['Nombre'] ?? base.replace(/_/g, ' ');
      const categoriaNombre = campos['Categoría'] ?? carpeta;
      const codigo = primerCampo(campos, ['Código del producto', 'Código de barras']) ?? base;
      const descripcionPartes = [
        primerCampo(campos, ['Ingredientes/especificaciones', 'Tipo de producto/especificaciones']),
        campos['Contenido'],
      ].filter(Boolean);
      if (campos['Vida de estantería']) descripcionPartes.push(`Vida de estantería: ${campos['Vida de estantería']}`);
      if (campos['Modo de conservación']) descripcionPartes.push(`Conservación: ${campos['Modo de conservación']}`);
      const descripcion = descripcionPartes.join(' — ');

      const presentacionTexto = campos['Presentación'];
      const lineaPrecio = primerCampo(campos, ['Precio publicado', 'Precio aproximado de referencia', 'Precio aproximado', 'Precio']);
      const precioBase = parsearPrecio(lineaPrecio);
      const pesoKg = parsearPesoKg(presentacionTexto);

      // --- categoría (crear si no existe, cachear por nombre) ---
      let categoriaId = categoriaIdCache.get(categoriaNombre);
      if (!categoriaId) {
        const { data: existente } = await supabase
          .from('categorias_producto')
          .select('id')
          .eq('nombre', categoriaNombre)
          .maybeSingle();

        if (existente) {
          categoriaId = existente.id;
        } else {
          const { data: creada, error } = await supabase
            .from('categorias_producto')
            .insert({ nombre: categoriaNombre })
            .select('id')
            .single();
          if (error || !creada) throw new Error(`No se pudo crear la categoría "${categoriaNombre}": ${error?.message}`);
          categoriaId = creada.id;
        }
        categoriaIdCache.set(categoriaNombre, categoriaId);
      }

      // --- imagen → Storage ---
      const sku = `${prefijoSku(categoriaNombre)}-${codigo}`;
      const rutaStorage = `${slugify(categoriaNombre)}/${sku}.webp`;
      const bytes = await sharp(readFileSync(join(dirPath, imagenNombre)))
        .resize({ width: ANCHO_IMAGEN, height: ANCHO_IMAGEN, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: CALIDAD_WEBP })
        .toBuffer();

      const { error: uploadError } = await supabase.storage
        .from('productos')
        .upload(rutaStorage, bytes, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
      if (uploadError) throw new Error(`No se pudo subir la imagen de ${sku}: ${uploadError.message}`);

      const { data: urlData } = supabase.storage.from('productos').getPublicUrl(rutaStorage);

      // --- producto (upsert por sku) ---
      const { data: productoRow, error: prodError } = await supabase
        .from('productos')
        .upsert(
          {
            sku,
            nombre,
            descripcion,
            unidad_medida: unidadMedida(presentacionTexto),
            precio_base: precioBase,
            imagen: urlData.publicUrl,
            estado: true,
            categoria_id: categoriaId,
          },
          { onConflict: 'sku' },
        )
        .select('id')
        .single();

      if (prodError || !productoRow) {
        console.error(`Error en producto ${sku}:`, prodError?.message);
        continue;
      }

      // --- presentación (peso/formato) ---
      if (presentacionTexto) {
        const { data: presentacionExistente } = await supabase
          .from('presentaciones_producto')
          .select('id')
          .eq('producto_id', productoRow.id)
          .maybeSingle();

        if (!presentacionExistente) {
          await supabase.from('presentaciones_producto').insert({
            producto_id: productoRow.id,
            peso: pesoKg,
            formato: presentacionTexto,
          });
        }
      }

      if (precioBase === null) {
        pendientes.push({ sku, nombre, motivo: 'Sin precio detectable en el .txt — revisar precio_base manualmente.' });
      }
      pendientes.push({
        sku,
        nombre,
        motivo: 'precio_mayorista y margen no vienen en las fichas — completar en el panel de admin.',
      });

      totalCreados += 1;
      console.log(`  ✓ ${sku} — ${nombre}`);
    }
  }

  console.log(`\nListo. ${totalCreados} productos procesados (creados/actualizados), ${categoriaIdCache.size} categorías.`);

  if (pendientes.length) {
    const lineas = [
      '# Pendientes de revisión — ingesta de catálogo',
      '',
      `Generado automáticamente por scripts/seed-productos.ts el ${new Date().toISOString()}.`,
      '',
      ...pendientes.map((p) => `- **${p.sku}** (${p.nombre}): ${p.motivo}`),
      '',
    ];
    const fs = await import('node:fs/promises');
    await fs.writeFile(join(PROJECT_ROOT, 'PRODUCTOS_PENDIENTES.md'), lineas.join('\n'), 'utf-8');
    console.log(`Se generó PRODUCTOS_PENDIENTES.md con ${pendientes.length} observaciones.`);
  }

  await supabase.auth.signOut();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
