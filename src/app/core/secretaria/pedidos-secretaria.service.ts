import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import { estadoUI, EstadoPedido, EstadoUI, ESTADOS_POR_GRUPO } from '../models/estado-pedido';

export type { EstadoPedido };

@Injectable({ providedIn: 'root' })
export class PedidosSecretariaService {
  private supabase = inject(SupabaseService).client;

  /** `grupo` es el paso de la fase B (pendiente/enviado/recibido/cancelado); sin filtro trae todos. */
  async listarPedidos(grupo?: EstadoUI) {
    let query = this.supabase
      .from('pedidos')
      .select(
        'id, codigo, fecha, estado, tipo_venta, canal_origen, clientes(nombre, identificacion)',
      )
      .order('fecha', { ascending: false });
    if (grupo) query = query.in('estado', ESTADOS_POR_GRUPO[grupo]);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async contarPorEstado() {
    const { data, error } = await this.supabase.from('pedidos').select('estado');
    if (error) throw error;
    // "Hoy" en la hora local del navegador (Bolivia), no en UTC. Se filtra por
    // updated_at: es cuándo pasó a entregado, no cuándo se creó el pedido.
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const { count: recibidosHoy } = await this.supabase
      .from('pedidos')
      .select('id', { count: 'exact', head: true })
      .eq('estado', 'entregado')
      .gte('updated_at', inicioHoy.toISOString());

    let pendientes = 0;
    let enviados = 0;
    for (const p of data ?? []) {
      const grupo = estadoUI(p.estado);
      if (grupo === 'pendiente') pendientes += 1;
      else if (grupo === 'enviado') enviados += 1;
    }
    return { pendientes, enviados, recibidosHoy: recibidosHoy ?? 0 };
  }

  async obtenerPedido(id: string) {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select(
        'id, codigo, fecha, estado, tipo_venta, clientes(nombre, identificacion, usuario_id), detalle_pedido(id, cantidad, precio_unitario, subtotal, productos(nombre)), envios(id, direccion_entrega, costo_envio, fecha_estimada, estado)',
      )
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async telefonoDeUsuario(usuarioId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('perfiles')
      .select('telefono')
      .eq('usuario_id', usuarioId)
      .maybeSingle();
    return data?.telefono ?? null;
  }

  async cambiarEstado(pedidoId: string, estado: EstadoPedido) {
    const { error } = await this.supabase.from('pedidos').update({ estado }).eq('id', pedidoId);
    if (error) throw error;
  }

  async actualizarEnvio(
    envioId: string,
    cambios: { costo_envio?: number | null; fecha_estimada?: string | null; estado?: string },
  ) {
    const { error } = await this.supabase.from('envios').update(cambios).eq('id', envioId);
    if (error) throw error;
  }
}
