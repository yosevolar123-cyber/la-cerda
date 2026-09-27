import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.service';

export interface Categoria {
  id: string;
  nombre: string;
  padre_id: string | null;
}

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  precio_base: number | null;
  precio_mayorista: number | null;
  imagen: string | null;
  unidad_medida: string | null;
  estado: boolean | null;
  categoria_id: string | null;
}

export interface Presentacion {
  id: string;
  producto_id: string | null;
  peso: number | null;
  formato: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private supabase = inject(SupabaseService).client;

  async listarCategorias(): Promise<Categoria[]> {
    const { data, error } = await this.supabase
      .from('categorias_producto')
      .select('id, nombre, padre_id')
      .order('nombre');
    if (error) throw error;
    return data ?? [];
  }

  async listarProductos(categoriaId?: string): Promise<Producto[]> {
    let query = this.supabase.from('productos').select('*').eq('estado', true).order('nombre');
    if (categoriaId) query = query.eq('categoria_id', categoriaId);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }

  async buscarProducto(id: string): Promise<Producto | null> {
    const { data, error } = await this.supabase.from('productos').select('*').eq('id', id).single();
    if (error) return null;
    return data;
  }

  async presentacionesDe(productoId: string): Promise<Presentacion[]> {
    const { data, error } = await this.supabase
      .from('presentaciones_producto')
      .select('*')
      .eq('producto_id', productoId);
    if (error) throw error;
    return data ?? [];
  }

  async resenasDe(productoId: string) {
    const { data, error } = await this.supabase
      .from('resenas_producto')
      .select('id, calificacion, comentario, fecha')
      .eq('producto_id', productoId)
      .eq('moderado', true)
      .order('fecha', { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}
