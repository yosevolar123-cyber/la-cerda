import type { ItemCarrito } from './cart/cart.service';

/** Número de negocio de La Cerda para pedidos por WhatsApp (sección 6). */
export const WHATSAPP_NEGOCIO = '59169541819';

/**
 * Nota de arquitectura: enviar mensajes 100% automáticos requeriría la
 * WhatsApp Business API (Twilio/Meta), de pago y con aprobación de negocio.
 * Este MVP usa enlaces "click to chat" (wa.me) que el cliente/secretaria
 * disparan con un clic — sin backend ni credenciales adicionales. Si el
 * negocio contrata la API oficial a futuro, este helper es el único lugar
 * a reemplazar por una llamada a esa API.
 */
export function enlaceWhatsApp(numero: string, mensaje: string): string {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function mensajePedidoCliente(datos: {
  codigo: string;
  items: ItemCarrito[];
  total: number;
  nombreCliente: string;
  telefono: string | null;
  direccion: string;
}): string {
  const lineasProductos = datos.items
    .map((i) => `• ${i.cantidad} x ${i.nombre} — Bs ${(i.cantidad * i.precio).toFixed(2)}`)
    .join('\n');
  return [
    `Pedido *${datos.codigo}* — La Cerda`,
    '',
    lineasProductos,
    '',
    `Total: Bs ${datos.total.toFixed(2)}`,
    '',
    `Cliente: ${datos.nombreCliente}`,
    datos.telefono ? `Teléfono: ${datos.telefono}` : null,
    `Dirección/ubicación: ${datos.direccion}`,
  ]
    .filter((l): l is string => l !== null)
    .join('\n');
}

export function mensajeEstadoPedido(datos: {
  codigo: string;
  estado: string;
  fechaEstimada?: string | null;
  costoEnvio?: number | null;
}): string {
  const partes = [
    `Hola, tu pedido *${datos.codigo}* de La Cerda cambió de estado: *${datos.estado}*.`,
  ];
  if (datos.fechaEstimada) partes.push(`Entrega estimada: ${datos.fechaEstimada}.`);
  if (datos.costoEnvio !== null && datos.costoEnvio !== undefined)
    partes.push(`Costo de envío: Bs ${datos.costoEnvio.toFixed(2)}.`);
  partes.push('Gracias por tu compra.');
  return partes.join(' ');
}
