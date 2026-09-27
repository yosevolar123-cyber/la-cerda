import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';

export interface RankingProducto {
  nombre: string;
  cantidad: number;
}

export interface EstadisticasAdmin {
  totalProductos: number;
  bajoStock: number;
  ventasHoy: number;
  ventasAyer: number;
  ventasSemana: number;
  ventasSemanaAnterior: number;
  ventasMes: number;
  masVendido: RankingProducto | null;
  menosVendido: RankingProducto | null;
}

export interface PuntoSerieVentas {
  fecha: string;
  total: number;
}

const UMBRAL_STOCK_BAJO = 10;

function inicioDeDia(fecha: Date): Date {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  return d;
}

function inicioDe(unidad: 'dia' | 'semana' | 'mes', offset = 0): Date {
  const ahora = new Date();
  if (unidad === 'dia') {
    const d = inicioDeDia(ahora);
    d.setDate(d.getDate() + offset);
    return d;
  }
  if (unidad === 'semana') {
    const d = inicioDeDia(ahora);
    d.setDate(d.getDate() - d.getDay() + offset * 7);
    return d;
  }
  const d = inicioDeDia(ahora);
  d.setDate(1);
  d.setMonth(d.getMonth() + offset);
  return d;
}

/** Variación porcentual actual vs. anterior; null si no hay base de comparación. */
export function variacionPorcentual(actual: number, anterior: number): number | null {
  if (anterior === 0) return actual > 0 ? null : 0;
  return ((actual - anterior) / anterior) * 100;
}

@Injectable({ providedIn: 'root' })
export class DashboardAdminService {
  private supabase = inject(SupabaseService).client;

  async obtenerEstadisticas(): Promise<EstadisticasAdmin> {
    const hoy = inicioDe('dia');
    const ayer = inicioDe('dia', -1);
    const inicioSemana = inicioDe('semana');
    const inicioSemanaAnterior = inicioDe('semana', -1);
    const inicioMes = inicioDe('mes');

    const [
      { count: totalProductos },
      inventarioBajo,
      ventasHoy,
      ventasAyer,
      ventasSemana,
      ventasSemanaAnterior,
      ventasMes,
      ranking,
    ] = await Promise.all([
      this.supabase
        .from('productos')
        .select('id', { count: 'exact', head: true })
        .eq('estado', true),
      this.supabase.from('inventario').select('id').lt('cantidad_disponible', UMBRAL_STOCK_BAJO),
      this.ventasEntre(hoy, null),
      this.ventasEntre(ayer, hoy),
      this.ventasEntre(inicioSemana, null),
      this.ventasEntre(inicioSemanaAnterior, inicioSemana),
      this.ventasEntre(inicioMes, null),
      this.rankingVentas(),
    ]);

    return {
      totalProductos: totalProductos ?? 0,
      bajoStock: inventarioBajo.data?.length ?? 0,
      ventasHoy,
      ventasAyer,
      ventasSemana,
      ventasSemanaAnterior,
      ventasMes,
      masVendido: ranking.at(0) ?? null,
      menosVendido: ranking.length > 1 ? ranking.at(-1)! : null,
    };
  }

  /** Serie diaria de ventas para el gráfico de tendencia (fase E). */
  async serieVentasDiarias(dias: number): Promise<PuntoSerieVentas[]> {
    const desde = inicioDe('dia', -(dias - 1));
    const { data: pedidos } = await this.supabase
      .from('pedidos')
      .select('id, fecha')
      .gte('fecha', desde.toISOString())
      .neq('estado', 'cancelado');

    const idsPorDia = new Map<string, string[]>();
    for (const p of pedidos ?? []) {
      const clave = (p.fecha ?? '').slice(0, 10);
      if (!idsPorDia.has(clave)) idsPorDia.set(clave, []);
      idsPorDia.get(clave)!.push(p.id);
    }

    const todosLosIds = (pedidos ?? []).map((p) => p.id);
    const subtotalesPorPedido = new Map<string, number>();
    if (todosLosIds.length > 0) {
      const { data: detalles } = await this.supabase
        .from('detalle_pedido')
        .select('pedido_id, subtotal')
        .in('pedido_id', todosLosIds);
      for (const d of detalles ?? []) {
        if (!d.pedido_id) continue;
        subtotalesPorPedido.set(
          d.pedido_id,
          (subtotalesPorPedido.get(d.pedido_id) ?? 0) + (d.subtotal ?? 0),
        );
      }
    }

    const serie: PuntoSerieVentas[] = [];
    for (let i = 0; i < dias; i++) {
      const dia = new Date(desde);
      dia.setDate(dia.getDate() + i);
      const clave = dia.toISOString().slice(0, 10);
      const ids = idsPorDia.get(clave) ?? [];
      const total = ids.reduce((sum, id) => sum + (subtotalesPorPedido.get(id) ?? 0), 0);
      serie.push({ fecha: clave, total });
    }
    return serie;
  }

  private async ventasEntre(desde: Date, hasta: Date | null): Promise<number> {
    let query = this.supabase
      .from('pedidos')
      .select('id')
      .gte('fecha', desde.toISOString())
      .neq('estado', 'cancelado');
    if (hasta) query = query.lt('fecha', hasta.toISOString());
    const { data: pedidosEnRango } = await query;
    const ids = (pedidosEnRango ?? []).map((p) => p.id);
    if (ids.length === 0) return 0;

    const { data } = await this.supabase
      .from('detalle_pedido')
      .select('subtotal')
      .in('pedido_id', ids);
    return (data ?? []).reduce((sum, d) => sum + (d.subtotal ?? 0), 0);
  }

  private async rankingVentas(): Promise<RankingProducto[]> {
    const { data } = await this.supabase
      .from('detalle_pedido')
      .select('cantidad, productos(nombre)')
      .not('productos', 'is', null);

    const totales = new Map<string, number>();
    for (const fila of data ?? []) {
      const nombre = (fila.productos as { nombre: string } | null)?.nombre;
      if (!nombre) continue;
      totales.set(nombre, (totales.get(nombre) ?? 0) + (fila.cantidad ?? 0));
    }
    return [...totales.entries()]
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }
}
