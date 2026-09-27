import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';

export interface ClienteResultado {
  id: string;
  nombre: string;
  identificacion: string;
  email: string | null;
  telefono: string | null;
}

@Injectable({ providedIn: 'root' })
export class ClientesBusquedaService {
  private supabase = inject(SupabaseService).client;

  /**
   * Búsqueda por nombre, identificación, correo o teléfono. Los dos últimos
   * solo existen para clientes que además tienen cuenta web (usuario_id):
   * un cliente de mostrador puro, cargado sin cuenta, solo es encontrable
   * por nombre/identificación — limitación conocida, documentada en
   * DECISIONES_Y_PENDIENTES.md.
   */
  async buscar(termino: string): Promise<ClienteResultado[]> {
    const { data, error } = await this.supabase
      .from('clientes')
      .select(
        'id, nombre, identificacion, usuarios!clientes_usuario_id_fkey(email, perfiles(telefono))',
      )
      .order('nombre')
      .limit(200);
    if (error) throw error;

    const t = termino.trim().toLowerCase();
    const resultados: ClienteResultado[] = (data ?? []).map((c) => {
      const usuario = c.usuarios as {
        email: string;
        perfiles: { telefono: string | null } | null;
      } | null;
      return {
        id: c.id,
        nombre: c.nombre,
        identificacion: c.identificacion,
        email: usuario?.email ?? null,
        telefono: usuario?.perfiles?.telefono ?? null,
      };
    });

    if (!t) return resultados.slice(0, 20);

    return resultados
      .filter(
        (c) =>
          c.nombre.toLowerCase().includes(t) ||
          c.identificacion.toLowerCase().includes(t) ||
          c.email?.toLowerCase().includes(t) ||
          c.telefono?.includes(t),
      )
      .slice(0, 20);
  }
}
