import type { Enums } from './database.types';

export type EstadoPedido = Enums<'estado_pedido_enum'>;

/**
 * Agrupación de presentación de los 6 valores crudos del enum en 3 pasos +
 * cancelado (fase B). El enum de base de datos NO cambia — esta es la única
 * función de mapeo, reutilizada en secretaria, cliente y la pantalla de
 * seguimiento; no duplicar esta lógica en los componentes.
 */
export type EstadoUI = 'pendiente' | 'enviado' | 'recibido' | 'cancelado';

const MAPA_ESTADO_UI: Record<EstadoPedido, EstadoUI> = {
  pendiente: 'pendiente',
  confirmado: 'pendiente',
  'en preparación': 'pendiente',
  enviado: 'enviado',
  entregado: 'recibido',
  cancelado: 'cancelado',
};

export function estadoUI(estado: EstadoPedido): EstadoUI {
  return MAPA_ESTADO_UI[estado];
}

/** "Entregado" se renombra a "Recibido" en toda la UI (mismo verbo que usa el cliente). */
export const ESTADO_UI_LABELS: Record<EstadoUI, string> = {
  pendiente: 'Pendiente',
  enviado: 'Enviado',
  recibido: 'Recibido',
  cancelado: 'Cancelado',
};

export const ESTADO_UI_TONE: Record<EstadoUI, 'warning' | 'secondary' | 'success' | 'danger'> = {
  pendiente: 'warning',
  enviado: 'secondary',
  recibido: 'success',
  cancelado: 'danger',
};

/** Grupos crudos que componen cada paso — para filtrar con `.in('estado', ...)`. */
export const ESTADOS_POR_GRUPO: Record<EstadoUI, EstadoPedido[]> = {
  pendiente: ['pendiente', 'confirmado', 'en preparación'],
  enviado: ['enviado'],
  recibido: ['entregado'],
  cancelado: ['cancelado'],
};

/** Etiqueta de un estado crudo (para el detalle, donde la secretaria ve el sub-estado exacto). */
export const ESTADO_RAW_LABELS: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  'en preparación': 'En preparación',
  enviado: 'Enviado',
  entregado: 'Recibido',
  cancelado: 'Cancelado',
};
