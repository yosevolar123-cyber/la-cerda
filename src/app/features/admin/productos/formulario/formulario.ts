import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductosAdminService } from '../../../../core/admin/productos-admin.service';
import { InventarioAdminService } from '../../../../core/admin/inventario-admin.service';
import { Button } from '../../../../shared/ui/button/button';
import { FieldError } from '../../../../shared/ui/field-error/field-error';

import { PageHeader } from '../../../../shared/ui/page-header/page-header';
@Component({
  selector: 'app-admin-productos-formulario',
  imports: [ReactiveFormsModule, Button, FieldError, PageHeader],
  templateUrl: './formulario.html',
  styleUrl: './formulario.scss',
})
export class FormularioProductoAdmin implements OnInit {
  private fb = inject(FormBuilder);
  private productosSvc = inject(ProductosAdminService);
  private inventarioSvc = inject(InventarioAdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productoId = signal<string | null>(null);
  categorias = signal<{ id: string; nombre: string }[]>([]);
  presentaciones = signal<{ id: string; peso: number | null; formato: string | null }[]>([]);
  imagenPreview = signal<string | null>(null);
  archivoImagen = signal<File | null>(null);
  errorImagen = signal<string | null>(null);
  guardando = signal(false);
  cargando = signal(true);
  errorGeneral = signal<string | null>(null);

  nuevaPresentacionFormato = signal('');
  nuevaPresentacionPeso = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    sku: ['', Validators.required],
    categoria_id: ['', Validators.required],
    unidad_medida: ['paquete' as 'kg' | 'unidad' | 'paquete', Validators.required],
    precio_base: [null as number | null],
    precio_mayorista: [null as number | null],
    margen: [null as number | null],
    estado: [true],
  });

  /** Solo se usa al crear: stock inicial que se registra como entrada en inventario. */
  stockInicial = this.fb.nonNullable.control(100, [Validators.required, Validators.min(0)]);

  get nombre() {
    return this.form.controls.nombre;
  }
  get sku() {
    return this.form.controls.sku;
  }
  get categoria_id() {
    return this.form.controls.categoria_id;
  }

  async ngOnInit() {
    this.categorias.set(await this.productosSvc.listarCategorias());

    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.productoId.set(id);
      const producto = await this.productosSvc.obtener(id);
      this.form.patchValue({
        nombre: producto.nombre,
        descripcion: producto.descripcion ?? '',
        sku: producto.sku,
        categoria_id: producto.categoria_id ?? '',
        unidad_medida: (producto.unidad_medida as 'kg' | 'unidad' | 'paquete') ?? 'paquete',
        precio_base: producto.precio_base,
        precio_mayorista: producto.precio_mayorista,
        margen: producto.margen,
        estado: producto.estado ?? true,
      });
      this.imagenPreview.set(producto.imagen);
      this.presentaciones.set(await this.productosSvc.presentacionesDe(id));
    }
    this.cargando.set(false);
  }

  seleccionarArchivo(evento: Event) {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    const error = this.productosSvc.validarImagen(archivo);
    if (error) {
      this.errorImagen.set(error);
      return;
    }
    this.errorImagen.set(null);
    this.archivoImagen.set(archivo);
    this.imagenPreview.set(URL.createObjectURL(archivo));
  }

  async guardar() {
    const esNuevo = !this.productoId();
    if (this.form.invalid || (esNuevo && this.stockInicial.invalid)) {
      this.form.markAllAsTouched();
      this.stockInicial.markAsTouched();
      return;
    }
    this.guardando.set(true);
    this.errorGeneral.set(null);
    const valores = this.form.getRawValue();

    try {
      let imagenUrl: string | undefined;
      const archivo = this.archivoImagen();
      if (archivo) {
        imagenUrl = await this.productosSvc.subirImagen(archivo, valores.sku);
      }

      const payload = {
        ...valores,
        precio_base: valores.precio_base || null,
        precio_mayorista: valores.precio_mayorista || null,
        margen: valores.margen || null,
        ...(imagenUrl ? { imagen: imagenUrl } : {}),
      };

      const idExistente = this.productoId();
      if (idExistente) {
        await this.productosSvc.actualizar(idExistente, payload);
      } else {
        const nuevoId = await this.productosSvc.crear(payload);
        this.productoId.set(nuevoId);
        const cantidad = this.stockInicial.value;
        if (cantidad > 0) {
          try {
            await this.inventarioSvc.registrarEntrada({ productoId: nuevoId, cantidad });
          } catch (e) {
            // El producto ya existe: quedamos en modo edición y avisamos.
            this.errorGeneral.set(
              `Producto creado, pero no se pudo registrar el stock (${
                e instanceof Error ? e.message : 'error desconocido'
              }). Agrégalo desde Inventario.`,
            );
            return;
          }
        }
      }
      this.router.navigateByUrl('/admin/productos');
    } catch (e) {
      this.errorGeneral.set((e as { message?: string })?.message ?? 'No se pudo guardar el producto.');
    } finally {
      this.guardando.set(false);
    }
  }

  async agregarPresentacion() {
    const id = this.productoId();
    if (!id || !this.nuevaPresentacionFormato().trim()) return;
    await this.productosSvc.agregarPresentacion(
      id,
      this.nuevaPresentacionPeso(),
      this.nuevaPresentacionFormato(),
    );
    this.presentaciones.set(await this.productosSvc.presentacionesDe(id));
    this.nuevaPresentacionFormato.set('');
    this.nuevaPresentacionPeso.set(null);
  }

  async eliminarPresentacion(id: string) {
    await this.productosSvc.eliminarPresentacion(id);
    this.presentaciones.set(this.presentaciones().filter((p) => p.id !== id));
  }
}
