import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductosAdminService } from '../../../../core/admin/productos-admin.service';
import { Badge } from '../../../../shared/ui/badge/badge';
import { Icon } from '../../../../shared/ui/icon/icon';

import { PageHeader } from '../../../../shared/ui/page-header/page-header';
@Component({
  selector: 'app-admin-productos-lista',
  imports: [RouterLink, Badge, Icon, PageHeader],
  templateUrl: './lista.html',
  styleUrl: './lista.scss',
})
export class ListaProductosAdmin implements OnInit {
  private productosSvc = inject(ProductosAdminService);

  productos = signal<Awaited<ReturnType<ProductosAdminService['listar']>>>([]);
  cargando = signal(true);

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
}
