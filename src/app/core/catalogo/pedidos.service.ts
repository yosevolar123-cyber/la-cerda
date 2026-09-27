import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import type { ItemCarrito } from '../cart/cart.service';
import type { Enums } from '../models/database.types';

export type CanalOrigen = 'cliente_web' | 'secretaria_mostrador';
export type ModalidadEntrega = 'local' | 'envio';

export interface CrearPedidoInput {
  /** Sin cliente = venta de mostrador anónima (solo posible desde secretaria). */
  clienteId?: string | null;
  tipoVenta: Enums<'tipo_cliente_enum'>;
  items: ItemCarrito[];
  /** Requerida cuando modalidadEntrega es 'envio' (por defecto). Ignorada si es 'local'. */
  direccion?: string;
  canalOrigen?: CanalOrigen;
  modalidadEntrega?: ModalidadEntrega;
  /** Solo para ventas de mostrador: el usuario (secretaria) que la origina. */
  vendedorId?: string;
}

export interface PedidoCreado {
  id: string;
  codigo: string;
}

@Injectable({ providedIn: 'root' })
export class PedidosService {
  private supabase = inject(SupabaseService).client;

  async crearPedido(input: CrearPedidoInput): Promise<PedidoCreado> {
    const canalOrigen = input.canalOrigen ?? 'cliente_web';
    const modalidadEntrega = input.modalidadEntrega ?? 'envio';

    // Snapshot del carrito en carritos/detalle_carrito (uso de las tablas del
    // esquema de negocio) antes de convertirlo en pedido — solo tiene sentido
    // cuando el pedido está asociado a un cliente concreto.
    let carritoId: string | null = null;
    if (input.clienteId) {
      const { data: carrito } = await this.supabase
        .from('carritos')
        .upsert({ cliente_id: input.clienteId }, { onConflict: 'cliente_id' })
        .select('id')
        .single();

      if (carrito) {
        carritoId = carrito.id;
        await this.supabase.from('detalle_carrito').delete().eq('carrito_id', carrito.id);
        await this.supabase
          .from('detalle_carrito')
          .insert(
            input.items.map((i) => ({
              carrito_id: carrito.id,
              producto_id: i.productoId,
              cantidad: i.cantidad,
            })),
          );
      }
    }

    const { data: pedido, error: pedidoError } = await this.supabase
      .from('pedidos')
      .insert({
        cliente_id: input.clienteId ?? null,
        vendedor_id: input.vendedorId ?? null,
        tipo_venta: input.tipoVenta,
        estado: 'pendiente',
        canal_origen: canalOrigen,
        modalidad_entrega: modalidadEntrega,
      })
      .select('id, codigo')
      .single();
    if (pedidoError || !pedido)
      throw new Error(pedidoError?.message ?? 'No se pudo crear el pedido.');

    const { error: detalleError } = await this.supabase.from('detalle_pedido').insert(
      input.items.map((i) => ({
        pedido_id: pedido.id,
        producto_id: i.productoId,
        cantidad: i.cantidad,
        precio_unitario: i.precio,
        descuento: 0,
        subtotal: i.cantidad * i.precio,
      })),
    );
    if (detalleError) throw new Error(detalleError.message);

    if (modalidadEntrega === 'envio' && input.direccion) {
      if (input.clienteId) {
        await this.supabase.from('direcciones_cliente').insert({
          cliente_id: input.clienteId,
          direccion: input.direccion,
          tipo: 'entrega',
        });
      }

      await this.supabase.from('envios').insert({
        pedido_id: pedido.id,
        direccion_entrega: input.direccion,
        estado: 'pendiente',
      });
    }

    if (carritoId) {
      await this.supabase.from('detalle_carrito').delete().eq('carrito_id', carritoId);
    }

    return { id: pedido.id, codigo: pedido.codigo! };
  }

  /** Fase C: el propio cliente confirma la recepción de su pedido (única transición que permite su RLS). */
  async marcarRecibido(pedidoId: string) {
    const { error } = await this.supabase
      .from('pedidos')
      .update({ estado: 'entregado' })
      .eq('id', pedidoId);
    if (error) throw error;
  }

  async obtenerPedidoConEnvio(id: string) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select('id, codigo, estado, fecha, envios(fecha_estimada)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async pedidosDeCliente(clienteId: string) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select(
        'id, codigo, fecha, estado, tipo_venta, detalle_pedido(cantidad, precio_unitario, subtotal, productos(nombre))',
      )
      .eq('cliente_id', clienteId)
      .order('fecha', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}
