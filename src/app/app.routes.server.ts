import { RenderMode, ServerRoute } from '@angular/ssr';

// La app es enteramente dinámica (auth por sesión, datos en vivo de Supabase,
// carrito en localStorage): no hay contenido estático que valga la pena
// prerenderizar. Se sirve como SPA (client-side rendering) en todas las rutas.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
