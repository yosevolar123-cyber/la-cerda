import { Injectable, InjectionToken, computed, inject, signal } from '@angular/core';

export interface ItemCarrito {
  productoId: string;
  nombre: string;
  precio: number;
  imagen: string | null;
  cantidad: number;
}

/**
 * Clave de localStorage para esta instancia del carrito. Por defecto es el
 * carrito del cliente ('la-cerda:carrito'); la venta de mostrador de
 * secretaria provee un valor distinto a nivel de ruta para obtener su propia
 * instancia de CartService sin tocar el carrito del cliente que esté
 * navegando en el mismo dispositivo. Ver secretaria/venta/venta.routes.ts.
 */
export const CART_STORAGE_KEY = new InjectionToken<string>('CART_STORAGE_KEY', {
  providedIn: 'root',
  factory: () => 'la-cerda:carrito',
});

function leerStorage(key: string): ItemCarrito[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as ItemCarrito[]) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private storageKey = inject(CART_STORAGE_KEY);

  private readonly _items = signal<ItemCarrito[]>(leerStorage(this.storageKey));
  private readonly _abierto = signal(false);

  readonly items = this._items.asReadonly();
  readonly abierto = this._abierto.asReadonly();

  readonly cantidadTotal = computed(() => this._items().reduce((sum, i) => sum + i.cantidad, 0));
  readonly total = computed(() => this._items().reduce((sum, i) => sum + i.cantidad * i.precio, 0));

  private guardar() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this._items()));
    } catch {
      /* almacenamiento no disponible (modo privado, etc.) — el carrito solo vive en memoria */
    }
  }

  agregar(producto: Omit<ItemCarrito, 'cantidad'>, cantidad = 1) {
    this._items.update((items) => {
      const existente = items.find((i) => i.productoId === producto.productoId);
      if (existente) {
        return items.map((i) =>
          i.productoId === producto.productoId ? { ...i, cantidad: i.cantidad + cantidad } : i,
        );
      }
      return [...items, { ...producto, cantidad }];
    });
    this.guardar();
    this.abrir();
  }

  actualizarCantidad(productoId: string, cantidad: number) {
    if (cantidad <= 0) {
      this.quitar(productoId);
      return;
    }
    this._items.update((items) =>
      items.map((i) => (i.productoId === productoId ? { ...i, cantidad } : i)),
    );
    this.guardar();
  }

  quitar(productoId: string) {
    this._items.update((items) => items.filter((i) => i.productoId !== productoId));
    this.guardar();
  }

  vaciar() {
    this._items.set([]);
    this.guardar();
  }

  abrir() {
    this._abierto.set(true);
  }

  cerrar() {
    this._abierto.set(false);
  }

  toggle() {
    this._abierto.update((v) => !v);
  }
}
