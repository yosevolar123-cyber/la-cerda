import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Presentacion, Producto, ProductosService } from '../../../core/catalogo/productos.service';
import { CartService } from '../../../core/cart/cart.service';
import { Button } from '../../../shared/ui/button/button';
import { Badge } from '../../../shared/ui/badge/badge';
import { Icon } from '../../../shared/ui/icon/icon';

@Component({
  selector: 'app-detalle',
  imports: [RouterLink, Button, Badge, Icon],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss',
})
export class Detalle implements OnInit {
  private route = inject(ActivatedRoute);
  private productosSvc = inject(ProductosService);
  private cart = inject(CartService);

  producto = signal<Producto | null>(null);
  presentaciones = signal<Presentacion[]>([]);
  resenas = signal<
    { id: string; calificacion: number | null; comentario: string | null; fecha: string | null }[]
  >([]);
  cantidad = signal(1);
  cargando = signal(true);
  noEncontrado = signal(false);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const producto = await this.productosSvc.buscarProducto(id);
    if (!producto) {
      this.noEncontrado.set(true);
      this.cargando.set(false);
      return;
    }
    this.producto.set(producto);
    const [presentaciones, resenas] = await Promise.all([
      this.productosSvc.presentacionesDe(id),
      this.productosSvc.resenasDe(id),
    ]);
    this.presentaciones.set(presentaciones);
    this.resenas.set(resenas);
    this.cargando.set(false);
  }

  cambiarCantidad(delta: number) {
    this.cantidad.update((c) => Math.max(1, c + delta));
  }

  agregarAlCarrito() {
    const p = this.producto();
    if (!p) return;
    this.cart.agregar(
      { productoId: p.id, nombre: p.nombre, precio: p.precio_base ?? 0, imagen: p.imagen },
      this.cantidad(),
    );
    this.cantidad.set(1);
  }
}
