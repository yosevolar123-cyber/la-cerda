import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';
import type { TablesInsert, TablesUpdate } from '../models/database.types';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const TAMANO_MAXIMO = 15 * 1024 * 1024;

@Injectable({ providedIn: 'root' })
export class ProductosAdminService {
  private supabase = inject(SupabaseService).client;

  async listar() {
    const { data, error } = await this.supabase
      .from('productos')
      .select('*, categorias_producto(nombre)')
      .order('nombre');
    if (error) throw error;
    return data ?? [];
  }

  async obtener(id: string) {
    const { data, error } = await this.supabase.from('productos').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
  }

  async crear(producto: TablesInsert<'productos'>) {
    const { data, error } = await this.supabase
      .from('productos')
      .insert(producto)
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  async actualizar(id: string, cambios: TablesUpdate<'productos'>) {
    const { error } = await this.supabase.from('productos').update(cambios).eq('id', id);
    if (error) throw error;
  }

  async cambiarEstado(id: string, estado: boolean) {
    await this.actualizar(id, { estado });
  }

  validarImagen(archivo: File): string | null {
    if (!TIPOS_PERMITIDOS.includes(archivo.type))
      return 'Formato no permitido. Usa JPG, PNG, WEBP, GIF o AVIF.';
    if (archivo.size > TAMANO_MAXIMO) return 'La imagen supera los 15 MB permitidos.';
    return null;
  }

  async subirImagen(archivo: File, sku: string): Promise<string> {
    const ext = archivo.name.slice(archivo.name.lastIndexOf('.'));
    const ruta = `admin/${sku}-${Date.now()}${ext}`;
    const { error } = await this.supabase.storage
      .from('productos')
      .upload(ruta, archivo, { upsert: true });
    if (error) throw error;
    const { data } = this.supabase.storage.from('productos').getPublicUrl(ruta);
    return data.publicUrl;
  }

  async listarCategorias() {
    const { data, error } = await this.supabase
      .from('categorias_producto')
      .select('id, nombre')
      .order('nombre');
    if (error) throw error;
    return data ?? [];
  }

  async presentacionesDe(productoId: string) {
    const { data, error } = await this.supabase
      .from('presentaciones_producto')
      .select('*')
      .eq('producto_id', productoId);
    if (error) throw error;
    return data ?? [];
  }

  async agregarPresentacion(productoId: string, peso: number | null, formato: string) {
    const { error } = await this.supabase
      .from('presentaciones_producto')
      .insert({ producto_id: productoId, peso, formato });
    if (error) throw error;
  }

  async eliminarPresentacion(id: string) {
    const { error } = await this.supabase.from('presentaciones_producto').delete().eq('id', id);
    if (error) throw error;
  }
}
