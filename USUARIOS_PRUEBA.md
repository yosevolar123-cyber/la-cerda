# Usuarios de prueba — La Cerda POS

Creados directamente en Supabase Auth (proyecto `hcbamtodpebrjlpaeeai`) el 26/09/2026.
El trigger `on_auth_user_created` generó automáticamente sus filas en `usuarios`,
`perfiles` y, para el cliente, `clientes`.

| Rol | Email | Contraseña | Nombre |
| --- | --- | --- | --- |
| Admin | admin@gmail.com | LaCerda2026!Admin | Admin La Cerda |
| Secretaria (rol `vendedor` en BD) | secretaria@gmail.com | LaCerda2026!Secre | Secretaria La Cerda |
| Cliente | cliente@gmail.com | LaCerda2026!Cliente | Cliente Demo |

**No compartir este archivo fuera del equipo de desarrollo.** Antes de ir a
producción, cambiar estas contraseñas o eliminar estas cuentas de demostración.

## Notas

- `cliente@gmail.com` ya tiene una fila en `clientes` con `identificacion = "9999999 LP"`
  (CI de prueba) y `telefono = "70011223"` — útil para probar el flujo de checkout
  y el enlace de WhatsApp de principio a fin.
- Cualquier usuario que se registre por su cuenta desde la app (rol `cliente` por
  defecto) recibe una `identificacion` provisional `PENDIENTE-xxxxxxxx` si no la
  indicó en el formulario de registro — pendiente de completar en su perfil o por
  el admin.
