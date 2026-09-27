import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import type { Enums } from '../models/database.types';

@Injectable({ providedIn: 'root' })
export class UsuariosAdminService {
  private supabase = inject(SupabaseService).client;

  async listar() {
    const { data, error } = await this.supabase
      .from('usuarios')
      .select('id, email, estado, verificado, roles(nombre), perfiles(nombre, telefono)')
      .order('email');
    if (error) throw error;
    return data ?? [];
  }

  async listarRoles() {
    const { data, error } = await this.supabase.from('roles').select('id, nombre').order('nombre');
    if (error) throw error;
    return data ?? [];
  }

  async cambiarRol(usuarioId: string, rolId: string) {
    const { error } = await this.supabase
      .from('usuarios')
      .update({ rol_id: rolId })
      .eq('id', usuarioId);
    if (error) throw error;
  }

  async cambiarEstado(usuarioId: string, estado: Enums<'estado_usuario_enum'>) {
    const { error } = await this.supabase.from('usuarios').update({ estado }).eq('id', usuarioId);
    if (error) throw error;
  }
}
