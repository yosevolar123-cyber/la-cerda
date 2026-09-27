import { Component, OnInit, inject, input, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Categoria, Producto, ProductosService } from '../../../core/catalogo/productos.service';
import { CartService } from '../../../core/cart/cart.service';
import { Card } from '../../../shared/ui/card/card';
import { Button } from '../../../shared/ui/button/button';
import { Badge } from '../../../shared/ui/badge/badge';
import { Icon } from '../../../shared/ui/icon/icon';

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

@Component({
  selector: 'app-lista',
  imports: [RouterLink, Card, Button, Badge, Icon],
  templateUrl: './lista.html',
  styleUrl: './lista.scss',
})
export class Lista implements OnInit {
  private productosSvc = inject(ProductosService);
  private cart = inject(CartService);

  /** false en la venta de mostrador: ahí la pantalla ya tiene su propio encabezado de trabajo.
   *  Se enlaza desde `data` de la ruta (withComponentInputBinding). */
  // withComponentInputBinding pone `undefined` cuando la ruta no trae ese dato
  // (no el valor por defecto): solo un `false` explícito oculta el hero.
  mostrarHero = input(true, { transform: (v: boolean | undefined) => v !== false });

  categorias = signal<Categoria[]>([]);
  productos = signal<Producto[]>([]);
  categoriaActiva = signal<string | null>(null);
  busqueda = signal('');
  cargando = signal(true);
  /** Id del último producto agregado, para mostrar "Agregado" un instante en su botón. */
  agregadoReciente = signal<string | null>(null);
  private temporizadorAgregado: ReturnType<typeof setTimeout> | undefined;

  imagenPorCategoria = computed<Record<string, string | null>>(() => {
    const mapa: Record<string, string | null> = {};
    for (const p of this.productos()) {
      if (p.categoria_id && !mapa[p.categoria_id] && p.imagen) mapa[p.categoria_id] = p.imagen;
    }
    return mapa;
  });

  productosFiltrados = computed(() => {
    const cat = this.categoriaActiva();
    const termino = normalizar(this.busqueda().trim());
    return this.productos().filter(
      (p) =>
        (!cat || p.categoria_id === cat) && (!termino || normalizar(p.nombre).includes(termino)),
    );
  });

  async ngOnInit() {
    const [categorias, productos] = await Promise.all([
      this.productosSvc.listarCategorias(),
      this.productosSvc.listarProductos(),
    ]);
    this.categorias.set(categorias);
    this.productos.set(productos);
    this.cargando.set(false);
  }

  seleccionarCategoria(id: string | null) {
    this.categoriaActiva.set(id);
  }

  agregarAlCarrito(p: Producto, evento: Event) {
    evento.preventDefault();
    evento.stopPropagation();
    this.cart.agregar({
      productoId: p.id,
      nombre: p.nombre,
      precio: p.precio_base ?? 0,
      imagen: p.imagen,
    });
    clearTimeout(this.temporizadorAgregado);
    this.agregadoReciente.set(p.id);
    this.temporizadorAgregado = setTimeout(() => this.agregadoReciente.set(null), 1200);
  }
}
