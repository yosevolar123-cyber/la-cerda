import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { InventarioAdminService } from '../../../core/admin/inventario-admin.service';
import { Badge } from '../../../shared/ui/badge/badge';
import { Button } from '../../../shared/ui/button/button';
import { Card } from '../../../shared/ui/card/card';

import { PageHeader } from '../../../shared/ui/page-header/page-header';
import { Icon } from '../../../shared/ui/icon/icon';
@Component({
  selector: 'app-admin-inventario',
  imports: [ReactiveFormsModule, Badge, Button, Card, PageHeader, Icon],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
})
export class InventarioAdmin implements OnInit {
  private inventarioSvc = inject(InventarioAdminService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  inventario = signal<Awaited<ReturnType<InventarioAdminService['listar']>>>([]);
  almacenes = signal<{ id: string; nombre: string }[]>([]);
  productos = signal<{ id: string; nombre: string }[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal<string | null>(null);
  mostrarFormulario = signal(false);

  form = this.fb.nonNullable.group({
    productoId: ['', Validators.required],
    almacenId: ['', Validators.required],
    cantidad: [0, [Validators.required, Validators.min(1)]],
    fechaVencimiento: ['', Validators.required],
  });

  nuevoAlmacenNombre = signal('');

  async ngOnInit() {
    await this.cargar();
  }

  async cargar() {
    this.cargando.set(true);
    const [inventario, almacenes, productos] = await Promise.all([
      this.inventarioSvc.listar(),
      this.inventarioSvc.listarAlmacenes(),
      this.inventarioSvc.listarProductos(),
    ]);
    this.inventario.set(inventario);
    this.almacenes.set(almacenes);
    this.productos.set(productos);
    this.cargando.set(false);
  }

  esBajoStock(cantidad: number | null) {
    return this.inventarioSvc.esBajoStock(cantidad);
  }

  proximoAVencer(fecha: string | null | undefined) {
    return this.inventarioSvc.proximoAVencer(fecha);
  }

  async crearAlmacen() {
    const nombre = this.nuevoAlmacenNombre().trim();
    if (!nombre) return;
    await this.inventarioSvc.crearAlmacen(nombre, 'cámara de frío');
    this.nuevoAlmacenNombre.set('');
    this.almacenes.set(await this.inventarioSvc.listarAlmacenes());
  }

  async registrarEntrada() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const usuarioId = this.auth.usuario()?.id;
    if (!usuarioId) return;

    this.guardando.set(true);
    this.error.set(null);
    try {
      const v = this.form.getRawValue();
      await this.inventarioSvc.registrarEntrada({
        productoId: v.productoId,
        almacenId: v.almacenId,
        cantidad: v.cantidad,
        fechaVencimiento: v.fechaVencimiento,
        usuarioId,
      });
      this.form.reset({ productoId: '', almacenId: '', cantidad: 0, fechaVencimiento: '' });
      this.mostrarFormulario.set(false);
      await this.cargar();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No se pudo registrar la entrada.');
    } finally {
      this.guardando.set(false);
    }
  }

  async registrarSalida(inventarioId: string) {
    const usuarioId = this.auth.usuario()?.id;
    if (!usuarioId) return;
    const cantidad = Number(prompt('¿Cuántas unidades salen?'));
    if (!cantidad || cantidad <= 0) return;
    try {
      await this.inventarioSvc.registrarMovimiento(inventarioId, 'salida', cantidad, usuarioId);
      await this.cargar();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo registrar el movimiento.');
    }
  }
}
