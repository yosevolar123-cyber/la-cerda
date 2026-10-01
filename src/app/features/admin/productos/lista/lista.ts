import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductosAdminService } from '../../../../core/admin/productos-admin.service';
import { InventarioAdminService } from '../../../../core/admin/inventario-admin.service';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Button } from '../../../../shared/ui/button/button';
import { Icon } from '../../../../shared/ui/icon/icon';

import { PageHeader } from '../../../../shared/ui/page-header/page-header';

type ProductoFila = Awaited<ReturnType<ProductosAdminService['listar']>>[number];

@Component({
  selector: 'app-admin-productos-lista',
  imports: [RouterLink, Badge, Button, Icon, PageHeader],
  templateUrl: './lista.html',
  styleUrl: './lista.scss',
})
export class ListaProductosAdmin implements OnInit {
  private productosSvc = inject(ProductosAdminService);
  private inventarioSvc = inject(InventarioAdminService);

  productos = signal<ProductoFila[]>([]);
  cargando = signal(true);

  // --- Modal "Ajustar stock" ---
  private dialogo = viewChild<ElementRef<HTMLDialogElement>>('dialogoStock');
  ajustando = signal<ProductoFila | null>(null);
  nuevaCantidad = signal<number | null>(null);
  guardandoStock = signal(false);
  errorStock = signal<string | null>(null);

  /** Diferencia que se registrará como movimiento: >0 entrada, <0 salida. */
  diferencia = computed(() => {
    const p = this.ajustando();
    const nueva = this.nuevaCantidad();
    if (!p || nueva === null || Number.isNaN(nueva)) return 0;
    return nueva - p.stock;
  });

  async ngOnInit() {
    await this.cargar();
  }

  async cargar() {
    this.cargando.set(true);
    this.productos.set(await this.productosSvc.listar());
    this.cargando.set(false);
  }

  async alternarEstado(id: string, estadoActual: boolean | null) {
    await this.productosSvc.cambiarEstado(id, !estadoActual);
    await this.cargar();
  }

  esBajoStock(cantidad: number) {
    return this.inventarioSvc.esBajoStock(cantidad);
  }

  abrirAjuste(p: ProductoFila) {
    this.ajustando.set(p);
    this.nuevaCantidad.set(p.stock);
    this.errorStock.set(null);
    this.dialogo()?.nativeElement.showModal();
  }

  cerrarAjuste() {
    this.dialogo()?.nativeElement.close();
  }

  /** Botones rápidos ±: parten de la cantidad escrita (o la actual) y nunca bajan de 0. */
  sumar(delta: number) {
    const base = this.nuevaCantidad() ?? this.ajustando()?.stock ?? 0;
    this.nuevaCantidad.set(Math.max(0, base + delta));
  }

  leerCantidad(valor: string) {
    this.nuevaCantidad.set(valor === '' ? null : Number(valor));
  }

  async guardarAjuste() {
    const p = this.ajustando();
    const nueva = this.nuevaCantidad();
    if (!p) return;
    if (nueva === null || !Number.isInteger(nueva) || nueva < 0) {
      this.errorStock.set('Ingresa una cantidad entera de 0 o más.');
      return;
    }
    if (this.diferencia() === 0) {
      this.cerrarAjuste();
      return;
    }
    this.guardandoStock.set(true);
    this.errorStock.set(null);
    try {
      await this.productosSvc.ajustarStock(p.id, nueva);
      this.productos.update((lista) =>
        lista.map((fila) => (fila.id === p.id ? { ...fila, stock: nueva } : fila)),
      );
      this.cerrarAjuste();
    } catch (e) {
      this.errorStock.set(e instanceof Error ? e.message : 'No se pudo ajustar el stock.');
    } finally {
      this.guardandoStock.set(false);
    }
  }
}
