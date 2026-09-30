import type { Enums } from './database.types';

export type Rol = Enums<'rol_enum'>;

/**
 * Único lugar donde se traduce el valor de rol_enum a la etiqueta visible.
 * `vendedor` en la base de datos se muestra como "Secretaria" en toda la UI —
 * no hardcodear esta traducción en componentes individuales.
 */
export const ROLE_LABELS: Record<Rol, string> = {
  admin: 'Admin',
  vendedor: 'Secretaria',
  cliente: 'Cliente',
};

export const ROLE_HOME_ROUTE: Record<Rol, string> = {
  admin: '/admin',
  vendedor: '/secretaria',
  cliente: '/catalogo',
};
