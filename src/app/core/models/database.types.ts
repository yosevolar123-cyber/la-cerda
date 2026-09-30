// Generado automáticamente desde el esquema de Supabase
// (mcp__supabase__generate_typescript_types). No editar a mano — si el
// esquema cambia, regenerar este archivo con esa herramienta.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      almacenes: {
        Row: {
          created_at: string | null;
          id: string;
          nombre: string;
          tipo: string | null;
          ubicacion: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          nombre: string;
          tipo?: string | null;
          ubicacion?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          nombre?: string;
          tipo?: string | null;
          ubicacion?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      auditoria_logs: {
        Row: {
          accion: string | null;
          created_at: string | null;
          id: string;
          tabla_afectada: string;
          timestamp: string | null;
          updated_at: string | null;
          usuario_id: string | null;
          valores_anteriores: Json | null;
          valores_nuevos: Json | null;
        };
        Insert: {
          accion?: string | null;
          created_at?: string | null;
          id?: string;
          tabla_afectada: string;
          timestamp?: string | null;
          updated_at?: string | null;
          usuario_id?: string | null;
          valores_anteriores?: Json | null;
          valores_nuevos?: Json | null;
        };
        Update: {
          accion?: string | null;
          created_at?: string | null;
          id?: string;
          tabla_afectada?: string;
          timestamp?: string | null;
          updated_at?: string | null;
          usuario_id?: string | null;
          valores_anteriores?: Json | null;
          valores_nuevos?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'auditoria_logs_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      carritos: {
        Row: {
          cliente_id: string | null;
          created_at: string | null;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          cliente_id?: string | null;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          cliente_id?: string | null;
          created_at?: string | null;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'carritos_cliente_id_fkey';
            columns: ['cliente_id'];
            isOneToOne: true;
            referencedRelation: 'clientes';
            referencedColumns: ['id'];
          },
        ];
      };
      categorias_producto: {
        Row: {
          created_at: string | null;
          id: string;
          nombre: string;
          padre_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          nombre: string;
          padre_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          nombre?: string;
          padre_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'categorias_producto_padre_id_fkey';
            columns: ['padre_id'];
            isOneToOne: false;
            referencedRelation: 'categorias_producto';
            referencedColumns: ['id'];
          },
        ];
      };
      certificaciones_sanitarias: {
        Row: {
          created_at: string | null;
          entidad_emisora: string;
          fecha_emision: string;
          fecha_vencimiento: string;
          id: string;
          numero_registro: string;
          producto_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          entidad_emisora: string;
          fecha_emision: string;
          fecha_vencimiento: string;
          id?: string;
          numero_registro: string;
          producto_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          entidad_emisora?: string;
          fecha_emision?: string;
          fecha_vencimiento?: string;
          id?: string;
          numero_registro?: string;
          producto_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'certificaciones_sanitarias_producto_id_fkey';
            columns: ['producto_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
      clientes: {
        Row: {
          created_at: string | null;
          id: string;
          identificacion: string;
          limite_credito: number | null;
          lista_precios: string | null;
          nombre: string;
          tipo: Database['public']['Enums']['tipo_cliente_enum'];
          updated_at: string | null;
          usuario_id: string | null;
          vendedor_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          identificacion: string;
          limite_credito?: number | null;
          lista_precios?: string | null;
          nombre: string;
          tipo?: Database['public']['Enums']['tipo_cliente_enum'];
          updated_at?: string | null;
          usuario_id?: string | null;
          vendedor_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          identificacion?: string;
          limite_credito?: number | null;
          lista_precios?: string | null;
          nombre?: string;
          tipo?: Database['public']['Enums']['tipo_cliente_enum'];
          updated_at?: string | null;
          usuario_id?: string | null;
          vendedor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'clientes_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: true;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'clientes_vendedor_id_fkey';
            columns: ['vendedor_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      cuentas_por_cobrar: {
        Row: {
          cliente_id: string | null;
          created_at: string | null;
          estado: Database['public']['Enums']['estado_factura_enum'];
          fecha_vencimiento: string;
          id: string;
          monto: number | null;
          updated_at: string | null;
        };
        Insert: {
          cliente_id?: string | null;
          created_at?: string | null;
          estado?: Database['public']['Enums']['estado_factura_enum'];
          fecha_vencimiento: string;
          id?: string;
          monto?: number | null;
          updated_at?: string | null;
        };
        Update: {
          cliente_id?: string | null;
          created_at?: string | null;
          estado?: Database['public']['Enums']['estado_factura_enum'];
          fecha_vencimiento?: string;
          id?: string;
          monto?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cuentas_por_cobrar_cliente_id_fkey';
            columns: ['cliente_id'];
            isOneToOne: false;
            referencedRelation: 'clientes';
            referencedColumns: ['id'];
          },
        ];
      };
      cupones: {
        Row: {
          codigo: string;
          created_at: string | null;
          descuento: number | null;
          fecha_fin: string;
          fecha_inicio: string;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          codigo: string;
          created_at?: string | null;
          descuento?: number | null;
          fecha_fin: string;
          fecha_inicio: string;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          codigo?: string;
          created_at?: string | null;
          descuento?: number | null;
          fecha_fin?: string;
          fecha_inicio?: string;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      detalle_carrito: {
        Row: {
          cantidad: number | null;
          carrito_id: string | null;
          created_at: string | null;
          id: string;
          producto_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          cantidad?: number | null;
          carrito_id?: string | null;
          created_at?: string | null;
          id?: string;
          producto_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          cantidad?: number | null;
          carrito_id?: string | null;
          created_at?: string | null;
          id?: string;
          producto_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'detalle_carrito_carrito_id_fkey';
            columns: ['carrito_id'];
            isOneToOne: false;
            referencedRelation: 'carritos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'detalle_carrito_producto_id_fkey';
            columns: ['producto_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
      detalle_factura: {
        Row: {
          cantidad: number | null;
          created_at: string | null;
          descuento: number | null;
          factura_id: string | null;
          id: string;
          precio_unitario: number | null;
          producto_id: string | null;
          subtotal: number | null;
          updated_at: string | null;
        };
        Insert: {
          cantidad?: number | null;
          created_at?: string | null;
          descuento?: number | null;
          factura_id?: string | null;
          id?: string;
          precio_unitario?: number | null;
          producto_id?: string | null;
          subtotal?: number | null;
          updated_at?: string | null;
        };
        Update: {
          cantidad?: number | null;
          created_at?: string | null;
          descuento?: number | null;
          factura_id?: string | null;
          id?: string;
          precio_unitario?: number | null;
          producto_id?: string | null;
          subtotal?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'detalle_factura_factura_id_fkey';
            columns: ['factura_id'];
            isOneToOne: false;
            referencedRelation: 'facturas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'detalle_factura_producto_id_fkey';
            columns: ['producto_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
      detalle_pedido: {
        Row: {
          cantidad: number | null;
          created_at: string | null;
          descuento: number | null;
          id: string;
          lote_id: string | null;
          pedido_id: string | null;
          precio_unitario: number | null;
          producto_id: string | null;
          subtotal: number | null;
          updated_at: string | null;
        };
        Insert: {
          cantidad?: number | null;
          created_at?: string | null;
          descuento?: number | null;
          id?: string;
          lote_id?: string | null;
          pedido_id?: string | null;
          precio_unitario?: number | null;
          producto_id?: string | null;
          subtotal?: number | null;
          updated_at?: string | null;
        };
        Update: {
          cantidad?: number | null;
          created_at?: string | null;
          descuento?: number | null;
          id?: string;
          lote_id?: string | null;
          pedido_id?: string | null;
          precio_unitario?: number | null;
          producto_id?: string | null;
          subtotal?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'detalle_pedido_lote_id_fkey';
            columns: ['lote_id'];
            isOneToOne: false;
            referencedRelation: 'lotes_produccion';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'detalle_pedido_pedido_id_fkey';
            columns: ['pedido_id'];
            isOneToOne: false;
            referencedRelation: 'pedidos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'detalle_pedido_producto_id_fkey';
            columns: ['producto_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
      direcciones_cliente: {
        Row: {
          cliente_id: string | null;
          created_at: string | null;
          direccion: string;
          id: string;
          tipo: string | null;
          updated_at: string | null;
        };
        Insert: {
          cliente_id?: string | null;
          created_at?: string | null;
          direccion: string;
          id?: string;
          tipo?: string | null;
          updated_at?: string | null;
        };
        Update: {
          cliente_id?: string | null;
          created_at?: string | null;
          direccion?: string;
          id?: string;
          tipo?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'direcciones_cliente_cliente_id_fkey';
            columns: ['cliente_id'];
            isOneToOne: false;
            referencedRelation: 'clientes';
            referencedColumns: ['id'];
          },
        ];
      };
      envios: {
        Row: {
          costo_envio: number | null;
          created_at: string | null;
          direccion_entrega: string;
          estado: string | null;
          fecha_estimada: string | null;
          fecha_real: string | null;
          id: string;
          pedido_id: string | null;
          temperatura_transporte: number | null;
          transportista: string | null;
          updated_at: string | null;
        };
        Insert: {
          costo_envio?: number | null;
          created_at?: string | null;
          direccion_entrega: string;
          estado?: string | null;
          fecha_estimada?: string | null;
          fecha_real?: string | null;
          id?: string;
          pedido_id?: string | null;
          temperatura_transporte?: number | null;
          transportista?: string | null;
          updated_at?: string | null;
        };
        Update: {
          costo_envio?: number | null;
          created_at?: string | null;
          direccion_entrega?: string;
          estado?: string | null;
          fecha_estimada?: string | null;
          fecha_real?: string | null;
          id?: string;
          pedido_id?: string | null;
          temperatura_transporte?: number | null;
          transportista?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'envios_pedido_id_fkey';
            columns: ['pedido_id'];
            isOneToOne: false;
            referencedRelation: 'pedidos';
            referencedColumns: ['id'];
          },
        ];
      };
      facturas: {
        Row: {
          created_at: string | null;
          estado: Database['public']['Enums']['estado_factura_enum'];
          fecha_emision: string | null;
          id: string;
          impuestos: number | null;
          pedido_id: string | null;
          subtotal: number | null;
          total: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          estado?: Database['public']['Enums']['estado_factura_enum'];
          fecha_emision?: string | null;
          id?: string;
          impuestos?: number | null;
          pedido_id?: string | null;
          subtotal?: number | null;
          total?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          estado?: Database['public']['Enums']['estado_factura_enum'];
          fecha_emision?: string | null;
          id?: string;
          impuestos?: number | null;
          pedido_id?: string | null;
          subtotal?: number | null;
          total?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'facturas_pedido_id_fkey';
            columns: ['pedido_id'];
            isOneToOne: false;
            referencedRelation: 'pedidos';
            referencedColumns: ['id'];
          },
        ];
      };
      inventario: {
        Row: {
          almacen_id: string | null;
          cantidad_disponible: number | null;
          created_at: string | null;
          id: string;
          lote_id: string | null;
          producto_id: string | null;
          temperatura_requerida: number | null;
          updated_at: string | null;
        };
        Insert: {
          almacen_id?: string | null;
          cantidad_disponible?: number | null;
          created_at?: string | null;
          id?: string;
          lote_id?: string | null;
          producto_id?: string | null;
          temperatura_requerida?: number | null;
          updated_at?: string | null;
        };
        Update: {
          almacen_id?: string | null;
          cantidad_disponible?: number | null;
          created_at?: string | null;
          id?: string;
          lote_id?: string | null;
          producto_id?: string | null;
          temperatura_requerida?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'inventario_almacen_id_fkey';
            columns: ['almacen_id'];
            isOneToOne: false;
            referencedRelation: 'almacenes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventario_lote_id_fkey';
            columns: ['lote_id'];
            isOneToOne: false;
            referencedRelation: 'lotes_produccion';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventario_producto_id_fkey';
            columns: ['producto_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
      lote_insumos: {
        Row: {
          cantidad: number | null;
          created_at: string | null;
          id: string;
          insumo_id: string | null;
          lote_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          cantidad?: number | null;
          created_at?: string | null;
          id?: string;
          insumo_id?: string | null;
          lote_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          cantidad?: number | null;
          created_at?: string | null;
          id?: string;
          insumo_id?: string | null;
          lote_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lote_insumos_insumo_id_fkey';
            columns: ['insumo_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lote_insumos_lote_id_fkey';
            columns: ['lote_id'];
            isOneToOne: false;
            referencedRelation: 'lotes_produccion';
            referencedColumns: ['id'];
          },
        ];
      };
      lotes_produccion: {
        Row: {
          cantidad_producida: number | null;
          created_at: string | null;
          fecha_produccion: string;
          fecha_vencimiento: string | null;
          id: string;
          linea_produccion: string | null;
          producto_id: string | null;
          turno: string | null;
          updated_at: string | null;
        };
        Insert: {
          cantidad_producida?: number | null;
          created_at?: string | null;
          fecha_produccion: string;
          fecha_vencimiento?: string | null;
          id?: string;
          linea_produccion?: string | null;
          producto_id?: string | null;
          turno?: string | null;
          updated_at?: string | null;
        };
        Update: {
          cantidad_producida?: number | null;
          created_at?: string | null;
          fecha_produccion?: string;
          fecha_vencimiento?: string | null;
          id?: string;
          linea_produccion?: string | null;
          producto_id?: string | null;
          turno?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lotes_produccion_producto_id_fkey';
            columns: ['producto_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
      movimientos_inventario: {
        Row: {
          cantidad: number | null;
          created_at: string | null;
          id: string;
          inventario_id: string | null;
          timestamp: string | null;
          tipo_movimiento: string | null;
          updated_at: string | null;
          usuario_id: string | null;
        };
        Insert: {
          cantidad?: number | null;
          created_at?: string | null;
          id?: string;
          inventario_id?: string | null;
          timestamp?: string | null;
          tipo_movimiento?: string | null;
          updated_at?: string | null;
          usuario_id?: string | null;
        };
        Update: {
          cantidad?: number | null;
          created_at?: string | null;
          id?: string;
          inventario_id?: string | null;
          timestamp?: string | null;
          tipo_movimiento?: string | null;
          updated_at?: string | null;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'movimientos_inventario_inventario_id_fkey';
            columns: ['inventario_id'];
            isOneToOne: false;
            referencedRelation: 'inventario';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'movimientos_inventario_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      notificaciones: {
        Row: {
          created_at: string | null;
          fecha: string | null;
          id: string;
          leida: boolean | null;
          mensaje: string;
          tipo: string;
          updated_at: string | null;
          usuario_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          fecha?: string | null;
          id?: string;
          leida?: boolean | null;
          mensaje: string;
          tipo: string;
          updated_at?: string | null;
          usuario_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          fecha?: string | null;
          id?: string;
          leida?: boolean | null;
          mensaje?: string;
          tipo?: string;
          updated_at?: string | null;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notificaciones_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      pagos: {
        Row: {
          created_at: string | null;
          factura_id: string | null;
          fecha: string | null;
          id: string;
          metodo: Database['public']['Enums']['metodo_pago_enum'];
          monto: number | null;
          referencia: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          factura_id?: string | null;
          fecha?: string | null;
          id?: string;
          metodo: Database['public']['Enums']['metodo_pago_enum'];
          monto?: number | null;
          referencia?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          factura_id?: string | null;
          fecha?: string | null;
          id?: string;
          metodo?: Database['public']['Enums']['metodo_pago_enum'];
          monto?: number | null;
          referencia?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'pagos_factura_id_fkey';
            columns: ['factura_id'];
            isOneToOne: false;
            referencedRelation: 'facturas';
            referencedColumns: ['id'];
          },
        ];
      };
      pedidos: {
        Row: {
          canal_origen: string | null;
          cliente_id: string | null;
          codigo: string | null;
          created_at: string | null;
          estado: Database['public']['Enums']['estado_pedido_enum'];
          fecha: string | null;
          id: string;
          modalidad_entrega: string | null;
          tipo_venta: Database['public']['Enums']['tipo_cliente_enum'];
          updated_at: string | null;
          vendedor_id: string | null;
        };
        Insert: {
          canal_origen?: string | null;
          cliente_id?: string | null;
          codigo?: string | null;
          created_at?: string | null;
          estado?: Database['public']['Enums']['estado_pedido_enum'];
          fecha?: string | null;
          id?: string;
          modalidad_entrega?: string | null;
          tipo_venta: Database['public']['Enums']['tipo_cliente_enum'];
          updated_at?: string | null;
          vendedor_id?: string | null;
        };
        Update: {
          canal_origen?: string | null;
          cliente_id?: string | null;
          codigo?: string | null;
          created_at?: string | null;
          estado?: Database['public']['Enums']['estado_pedido_enum'];
          fecha?: string | null;
          id?: string;
          modalidad_entrega?: string | null;
          tipo_venta?: Database['public']['Enums']['tipo_cliente_enum'];
          updated_at?: string | null;
          vendedor_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'pedidos_cliente_id_fkey';
            columns: ['cliente_id'];
            isOneToOne: false;
            referencedRelation: 'clientes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pedidos_vendedor_id_fkey';
            columns: ['vendedor_id'];
            isOneToOne: false;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      perfiles: {
        Row: {
          created_at: string | null;
          direccion: string | null;
          foto: string | null;
          id: string;
          nombre: string | null;
          telefono: string | null;
          updated_at: string | null;
          usuario_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          direccion?: string | null;
          foto?: string | null;
          id?: string;
          nombre?: string | null;
          telefono?: string | null;
          updated_at?: string | null;
          usuario_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          direccion?: string | null;
          foto?: string | null;
          id?: string;
          nombre?: string | null;
          telefono?: string | null;
          updated_at?: string | null;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'perfiles_usuario_id_fkey';
            columns: ['usuario_id'];
            isOneToOne: true;
            referencedRelation: 'usuarios';
            referencedColumns: ['id'];
          },
        ];
      };
      presentaciones_producto: {
        Row: {
          created_at: string | null;
          formato: string | null;
          id: string;
          peso: number | null;
          producto_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          formato?: string | null;
          id?: string;
          peso?: number | null;
          producto_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          formato?: string | null;
          id?: string;
          peso?: number | null;
          producto_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'presentaciones_producto_producto_id_fkey';
            columns: ['producto_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
      productos: {
        Row: {
          categoria_id: string | null;
          created_at: string | null;
          descripcion: string | null;
          estado: boolean | null;
          id: string;
          imagen: string | null;
          margen: number | null;
          nombre: string;
          precio_base: number | null;
          precio_mayorista: number | null;
          sku: string;
          unidad_medida: string | null;
          updated_at: string | null;
        };
        Insert: {
          categoria_id?: string | null;
          created_at?: string | null;
          descripcion?: string | null;
          estado?: boolean | null;
          id?: string;
          imagen?: string | null;
          margen?: number | null;
          nombre: string;
          precio_base?: number | null;
          precio_mayorista?: number | null;
          sku: string;
          unidad_medida?: string | null;
          updated_at?: string | null;
        };
        Update: {
          categoria_id?: string | null;
          created_at?: string | null;
          descripcion?: string | null;
          estado?: boolean | null;
          id?: string;
          imagen?: string | null;
          margen?: number | null;
          nombre?: string;
          precio_base?: number | null;
          precio_mayorista?: number | null;
          sku?: string;
          unidad_medida?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'productos_categoria_id_fkey';
            columns: ['categoria_id'];
            isOneToOne: false;
            referencedRelation: 'categorias_producto';
            referencedColumns: ['id'];
          },
        ];
      };
      promociones: {
        Row: {
          categoria_id: string | null;
          created_at: string | null;
          fecha_fin: string;
          fecha_inicio: string;
          id: string;
          producto_id: string | null;
          tipo: string | null;
          updated_at: string | null;
        };
        Insert: {
          categoria_id?: string | null;
          created_at?: string | null;
          fecha_fin: string;
          fecha_inicio: string;
          id?: string;
          producto_id?: string | null;
          tipo?: string | null;
          updated_at?: string | null;
        };
        Update: {
          categoria_id?: string | null;
          created_at?: string | null;
          fecha_fin?: string;
          fecha_inicio?: string;
          id?: string;
          producto_id?: string | null;
          tipo?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'promociones_categoria_id_fkey';
            columns: ['categoria_id'];
            isOneToOne: false;
            referencedRelation: 'categorias_producto';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'promociones_producto_id_fkey';
            columns: ['producto_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
      proveedores: {
        Row: {
          calificacion: number | null;
          condiciones_pago: string | null;
          contacto: string | null;
          created_at: string | null;
          id: string;
          nombre: string;
          updated_at: string | null;
        };
        Insert: {
          calificacion?: number | null;
          condiciones_pago?: string | null;
          contacto?: string | null;
          created_at?: string | null;
          id?: string;
          nombre: string;
          updated_at?: string | null;
        };
        Update: {
          calificacion?: number | null;
          condiciones_pago?: string | null;
          contacto?: string | null;
          created_at?: string | null;
          id?: string;
          nombre?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      resenas_producto: {
        Row: {
          calificacion: number | null;
          cliente_id: string | null;
          comentario: string | null;
          created_at: string | null;
          fecha: string | null;
          id: string;
          moderado: boolean | null;
          producto_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          calificacion?: number | null;
          cliente_id?: string | null;
          comentario?: string | null;
          created_at?: string | null;
          fecha?: string | null;
          id?: string;
          moderado?: boolean | null;
          producto_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          calificacion?: number | null;
          cliente_id?: string | null;
          comentario?: string | null;
          created_at?: string | null;
          fecha?: string | null;
          id?: string;
          moderado?: boolean | null;
          producto_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'resenas_producto_cliente_id_fkey';
            columns: ['cliente_id'];
            isOneToOne: false;
            referencedRelation: 'clientes';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'resenas_producto_producto_id_fkey';
            columns: ['producto_id'];
            isOneToOne: false;
            referencedRelation: 'productos';
            referencedColumns: ['id'];
          },
        ];
      };
      roles: {
        Row: {
          id: string;
          nombre: Database['public']['Enums']['rol_enum'];
        };
        Insert: {
          id?: string;
          nombre: Database['public']['Enums']['rol_enum'];
        };
        Update: {
          id?: string;
          nombre?: Database['public']['Enums']['rol_enum'];
        };
        Relationships: [];
      };
      usuarios: {
        Row: {
          created_at: string | null;
          email: string;
          estado: Database['public']['Enums']['estado_usuario_enum'];
          id: string;
          password_hash: string;
          rol_id: string | null;
          ultimo_acceso: string | null;
          updated_at: string | null;
          verificado: boolean | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          estado?: Database['public']['Enums']['estado_usuario_enum'];
          id: string;
          password_hash?: string;
          rol_id?: string | null;
          ultimo_acceso?: string | null;
          updated_at?: string | null;
          verificado?: boolean | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          estado?: Database['public']['Enums']['estado_usuario_enum'];
          id?: string;
          password_hash?: string;
          rol_id?: string | null;
          ultimo_acceso?: string | null;
          updated_at?: string | null;
          verificado?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'usuarios_rol_id_fkey';
            columns: ['rol_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
        ];
      };
      zonas_reparto: {
        Row: {
          created_at: string | null;
          id: string;
          nombre: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          nombre: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          nombre?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      agregar_stock: {
        Args: {
          p_producto_id: string;
          p_cantidad: number;
          p_almacen_id?: string;
          p_fecha_vencimiento?: string;
        };
        Returns: string;
      };
      auth_cliente_id: { Args: Record<PropertyKey, never>; Returns: string };
      auth_rol: {
        Args: Record<PropertyKey, never>;
        Returns: Database['public']['Enums']['rol_enum'];
      };
    };
    Enums: {
      estado_factura_enum: 'pagada' | 'pendiente' | 'vencida' | 'anulada';
      estado_pedido_enum:
        'pendiente' | 'confirmado' | 'en preparación' | 'enviado' | 'entregado' | 'cancelado';
      estado_usuario_enum: 'activo' | 'inactivo' | 'bloqueado';
      metodo_pago_enum: 'efectivo' | 'transferencia' | 'tarjeta' | 'crédito';
      rol_enum: 'admin' | 'vendedor' | 'cliente';
      tipo_cliente_enum: 'minorista' | 'mayorista';
    };
    CompositeTypes: { [_ in never]: never };
  };
};

type DefaultSchema = Database['public'];
export type Tables<T extends keyof DefaultSchema['Tables']> = DefaultSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof DefaultSchema['Tables']> =
  DefaultSchema['Tables'][T]['Update'];
export type Enums<T extends keyof DefaultSchema['Enums']> = DefaultSchema['Enums'][T];
