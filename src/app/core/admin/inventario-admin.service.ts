import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';

const UMBRAL_STOCK_BAJO = 10;
const DIAS_ALERTA_VENCIMIENTO = 7;

@Injectable({ providedIn: 'root' })
export class InventarioAdminService {
  private supabase = inject(SupabaseService).client;

  readonly umbralStockBajo = UMBRAL_STOCK_BAJO;

  async listar() {
    const { data, error } = await this.supabase
      .from('inventario')
      .select(
        'id, producto_id, almacen_id, cantidad_disponible, productos(nombre), almacenes(nombre), lotes_produccion(fecha_vencimiento)',
      )
      .order('cantidad_disponible', { ascending: true });
    if (error) throw error;
    return data ?? [];
  }

  esBajoStock(cantidad: number | null): boolean {
    return (cantidad ?? 0) < UMBRAL_STOCK_BAJO;
  }

  proximoAVencer(fechaVencimiento: string | null | undefined): boolean {
    if (!fechaVencimiento) return false;
    const dias = (new Date(fechaVencimiento).getTime() - Date.now()) / 86_400_000;
    return dias <= DIAS_ALERTA_VENCIMIENTO;
  }

  async listarAlmacenes() {
    const { data, error } = await this.supabase
      .from('almacenes')
      .select('id, nombre')
      .order('nombre');
    if (error) throw error;
    return data ?? [];
  }

  async crearAlmacen(nombre: string, tipo: 'cámara de frío' | 'seco') {
    const { data, error } = await this.supabase
      .from('almacenes')
      .insert({ nombre, tipo })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  async listarProductos() {
    const { data, error } = await this.supabase
      .from('productos')
      .select('id, nombre')
      .eq('estado', true)
      .order('nombre');
    if (error) throw error;
    return data ?? [];
  }

  /**
   * Entrada de stock (lote + inventario + movimiento 'entrada') en una sola
   * transacción vía RPC. Sin almacén usa el primero existente o crea
   * "Almacén principal".
   */
  async registrarEntrada(input: {
    productoId: string;
    cantidad: number;
    almacenId?: string;
    fechaVencimiento?: string;
  }) {
    const { data, error } = await this.supabase.rpc('agregar_stock', {
      p_producto_id: input.productoId,
      p_cantidad: input.cantidad,
      ...(input.almacenId ? { p_almacen_id: input.almacenId } : {}),
      ...(input.fechaVencimiento ? { p_fecha_vencimiento: input.fechaVencimiento } : {}),
    });
    if (error) throw new Error(error.message);
    return data;
  }

  async registrarMovimiento(
    inventarioId: string,
    tipo: 'salida' | 'merma',
    cantidad: number,
    usuarioId: string,
  ) {
    const { data: inv, error } = await this.supabase
      .from('inventario')
      .select('cantidad_disponible')
      .eq('id', inventarioId)
      .single();
    if (error || !inv) throw new Error('Inventario no encontrado');

    const nuevaCantidad = (inv.cantidad_disponible ?? 0) - cantidad;
    if (nuevaCantidad < 0) throw new Error('No hay suficiente stock disponible.');

    await this.supabase
      .from('inventario')
      .update({ cantidad_disponible: nuevaCantidad })
      .eq('id', inventarioId);
    await this.supabase.from('movimientos_inventario').insert({
      inventario_id: inventarioId,
      tipo_movimiento: tipo,
      cantidad,
      usuario_id: usuarioId,
    });
  }
}
