# La Cerda POS — decisiones tomadas y pendientes de revisión

Resumen entregado al cierre de la construcción inicial (26/09/2026). Ver también
`USUARIOS_PRUEBA.md` (credenciales de prueba) y `PRODUCTOS_PENDIENTES.md`
(observaciones generadas por el script de ingesta).

## Acción manual pendiente (bloqueante para el registro público)

**Desactivar "Confirm email" en Supabase Auth.** La sección 5.3 pide que el
registro de clientes no requiera verificación por correo, pero esa opción vive
en la configuración de la plataforma (Dashboard → Authentication → Sign In /
Providers → Email), no en el esquema SQL ni en el MCP de base de datos —
no hay herramienta de MCP para cambiarla, así que quedó sin tocar. Mientras
siga activada, un cliente que se registra queda con `email_confirmed_at`
en null y no puede iniciar sesión hasta confirmar un correo que, además,
no se está enviando con una plantilla de marca. **Desactívala antes de lanzar
el registro público.**

## Ambigüedades del catálogo resueltas

- El catálogo real tenía **3 fuentes**, no 2: `embutidos/` y
  `Pollo_Sofia_25_productos_4K/` (estructuradas, con precios reales) más 50
  archivos sueltos en la raíz (`01_..._` a `26_..._`) que resultaron ser un
  borrador anterior de los mismos productos de `embutidos/`. Se ingirió solo
  desde las dos carpetas estructuradas; los archivos sueltos se dejaron
  intactos, sin borrar, a la espera de que confirmes que puedes eliminarlos.
- El nombre de categoría de cada producto se tomó del campo `Categoría:`
  dentro de cada ficha `.txt` (más confiable que derivarlo del nombre de
  carpeta) → resultó en **"Embutidos"** y **"Productos de pollo"**.
- Ningún producto quedó sin precio (`precio_base`) — las 50 fichas traían un
  precio real. Sí quedaron sin dato: `precio_mayorista` y `margen` (no
  vienen en las fichas); revísalos en el panel de admin antes de vender al
  por mayor.

## Desviaciones del esquema literal de la sección 3 (documentadas también como comentarios SQL)

1. `productos.imagen` y `perfiles.foto` son `text` (URL de Storage), no `bytea`.
2. `usuarios.id` referencia `auth.users(id)` en vez de un `default` independiente
   — es una extensión 1:1 del usuario de Supabase Auth. `password_hash` no se
   usa para autenticar (Auth gestiona el hash real); guarda un valor fijo.
3. `clientes.usuario_id` (nuevo) enlaza el registro de negocio con el usuario
   autenticado — necesario para que un cliente vea/gestione sus propios
   pedidos por RLS. No estaba en el esquema original.
4. `pedidos.codigo` (nuevo) — el código de orden legible pedido en la sección 3.
5. `envios.costo_envio` (nuevo) — pedido explícitamente en la sección 7.
6. `carritos.cliente_id` y `perfiles.usuario_id` son `unique` (relaciones 1:1
   reales) — necesario para que Supabase infiera los joins correctamente y
   para el `upsert` del carrito en el checkout.

## Qué falta para producción (no bloqueante, pero recomendado)

- Completar `precio_mayorista`/`margen` de los 50 productos (panel admin).
- Cargar inventario real: no se inventó stock — `inventario`/`lotes_produccion`
  quedan vacíos hasta que el admin registre entradas reales desde
  `/admin/inventario`.
- Definir tarifas reales de `zonas_reparto` (hoy la tabla existe pero está
  vacía; la secretaria ingresa el costo de envío manualmente por pedido).
- Cambiar las contraseñas de las 3 cuentas de prueba (o eliminarlas) antes de
  lanzar.
- El botón "Registrar salida" de inventario usa `prompt()`/`alert()` del
  navegador como atajo — funcional pero tosco; cambiarlo por un modal propio
  es la mejora de UI más visible pendiente.
- No se implementó sincronización en tiempo real del carrito entre
  dispositivos: vive en `localStorage` y solo se refleja en
  `carritos`/`detalle_carrito` al confirmar el pedido.
- Sin pruebas automatizadas más allá del test por defecto de Angular.

## Cómo se probó

- `npm run build` compila sin errores (Angular 22, SSR configurado como CSR
  puro vía `RenderMode.Client`, ya que toda la app depende de sesión y datos
  en vivo).
- `npm test` pasa.
- Verificado end-to-end contra el proyecto real de Supabase por HTTP: lectura
  pública de productos e imágenes, bloqueo de escritura anónima por RLS, y
  login del usuario admin de prueba.
- No se pudo hacer una prueba interactiva en navegador real (Playwright) en
  este entorno: Chrome no está instalado y la instalación requiere `sudo`, que
  no está disponible. Recomendado: correr `npm start` y revisar manualmente
  el flujo completo (catálogo → carrito → checkout → WhatsApp; login de los
  3 roles) antes de dar por cerrada la fase de construcción.
