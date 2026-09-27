import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';

export interface DatosReporte {
  desde: string;
  hasta: string;
  totalVendido: number;
  numeroPedidos: number;
  ventasPorProducto: { nombre: string; cantidad: number; subtotal: number }[];
  stockPorCategoria: { categoria: string; producto: string; cantidad: number }[];
  masVendido: { nombre: string; cantidad: number } | null;
  menosVendido: { nombre: string; cantidad: number } | null;
}

@Injectable({ providedIn: 'root' })
export class ReportesAdminService {
  private supabase = inject(SupabaseService).client;

  async generar(desde: string, hasta: string): Promise<DatosReporte> {
    const hastaFin = `${hasta}T23:59:59`;

    const { data: pedidos } = await this.supabase
      .from('pedidos')
      .select('id')
      .gte('fecha', `${desde}T00:00:00`)
      .lte('fecha', hastaFin)
      .neq('estado', 'cancelado');
    const pedidoIds = (pedidos ?? []).map((p) => p.id);

    let ventasPorProducto: DatosReporte['ventasPorProducto'] = [];
    let totalVendido = 0;

    if (pedidoIds.length > 0) {
      const { data: detalles } = await this.supabase
        .from('detalle_pedido')
        .select('cantidad, subtotal, productos(nombre)')
        .in('pedido_id', pedidoIds);

      const totales = new Map<string, { cantidad: number; subtotal: number }>();
      for (const d of detalles ?? []) {
        const nombre = (d.productos as { nombre: string } | null)?.nombre ?? 'Producto sin nombre';
        const actual = totales.get(nombre) ?? { cantidad: 0, subtotal: 0 };
        actual.cantidad += d.cantidad ?? 0;
        actual.subtotal += d.subtotal ?? 0;
        totales.set(nombre, actual);
        totalVendido += d.subtotal ?? 0;
      }
      ventasPorProducto = [...totales.entries()]
        .map(([nombre, v]) => ({ nombre, ...v }))
        .sort((a, b) => b.subtotal - a.subtotal);
    }

    const { data: inventario } = await this.supabase
      .from('inventario')
      .select('cantidad_disponible, productos(nombre, categorias_producto(nombre))');

    const stockPorCategoria = (inventario ?? []).map((i) => ({
      categoria:
        (i.productos as { categorias_producto: { nombre: string } | null } | null)
          ?.categorias_producto?.nombre ?? 'Sin categoría',
      producto: (i.productos as { nombre: string } | null)?.nombre ?? '—',
      cantidad: i.cantidad_disponible ?? 0,
    }));

    const rankingCantidad = [...ventasPorProducto].sort((a, b) => b.cantidad - a.cantidad);

    return {
      desde,
      hasta,
      totalVendido,
      numeroPedidos: pedidoIds.length,
      ventasPorProducto,
      stockPorCategoria,
      masVendido: rankingCantidad.at(0)
        ? { nombre: rankingCantidad[0].nombre, cantidad: rankingCantidad[0].cantidad }
        : null,
      menosVendido:
        rankingCantidad.length > 1
          ? { nombre: rankingCantidad.at(-1)!.nombre, cantidad: rankingCantidad.at(-1)!.cantidad }
          : null,
    };
  }
}
