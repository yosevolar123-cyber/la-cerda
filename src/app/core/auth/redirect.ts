/**
 * Valida el `?redirect=` que llega al login/registro: solo rutas internas de la
 * app ("/checkout"), nunca URLs absolutas ni "//otro-dominio" (open redirect).
 */
export function destinoSeguro(redirect: string | null | undefined): string | null {
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) return null;
  if (redirect.startsWith('/auth/')) return null;
  return redirect;
}

/** El cliente llegó al login desde "Ir a pagar": se le explica por qué y que su carrito sigue ahí. */
export function vieneDelCheckout(redirect: string | null | undefined): boolean {
  return destinoSeguro(redirect)?.startsWith('/checkout') ?? false;
}
