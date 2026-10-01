import { Injectable, computed, inject, signal } from '@angular/core';
import type { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import type { Rol } from '../models/roles';

export interface RegistroDatos {
  email: string;
  password: string;
  nombre: string;
  telefono: string;
}

export interface ClienteActual {
  id: string;
  nombre: string;
  telefono: string | null;
  identificacion: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService).client;

  private readonly _session = signal<Session | null>(null);
  private readonly _rol = signal<Rol | null>(null);
  private readonly _cliente = signal<ClienteActual | null>(null);
  private readonly _cargando = signal(true);

  readonly session = this._session.asReadonly();
  readonly rol = this._rol.asReadonly();
  readonly cliente = this._cliente.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly usuario = computed<User | null>(() => this._session()?.user ?? null);
  readonly autenticado = computed(() => this._session() !== null);

  /** Los guards de ruta esperan esta promesa antes de decidir (evita la carrera
   *  con la carga inicial de sesión al arrancar la app). */
  readonly listo: Promise<void>;

  constructor() {
    let resolverListo!: () => void;
    this.listo = new Promise((resolve) => (resolverListo = resolve));

    this.supabase.auth.getSession().then(async ({ data }) => {
      this._session.set(data.session);
      await this.cargarRolYCliente(data.session);
      resolverListo();
    });

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this._session.set(session);
      this.cargarRolYCliente(session);
    });
  }

  private async cargarRolYCliente(session: Session | null) {
    if (!session) {
      this._rol.set(null);
      this._cliente.set(null);
      this._cargando.set(false);
      return;
    }
    const { data } = await this.supabase
      .from('usuarios')
      .select('roles(nombre)')
      .eq('id', session.user.id)
      .single();

    type FilaRol = { roles: { nombre: Rol } | { nombre: Rol }[] | null };
    const rolesRel = (data as FilaRol | null)?.roles;
    const nombreRol = Array.isArray(rolesRel) ? rolesRel[0]?.nombre : rolesRel?.nombre;
    this._rol.set(nombreRol ?? null);

    if (nombreRol === 'cliente') {
      const [{ data: clienteRow }, { data: perfilRow }] = await Promise.all([
        this.supabase
          .from('clientes')
          .select('id, nombre, identificacion')
          .eq('usuario_id', session.user.id)
          .maybeSingle(),
        this.supabase
          .from('perfiles')
          .select('telefono')
          .eq('usuario_id', session.user.id)
          .maybeSingle(),
      ]);
      this._cliente.set(
        clienteRow
          ? {
              id: clienteRow.id,
              nombre: clienteRow.nombre,
              identificacion: clienteRow.identificacion,
              telefono: perfilRow?.telefono ?? null,
            }
          : null,
      );
    } else {
      this._cliente.set(null);
    }

    this._cargando.set(false);
  }

  /** Alta de un cliente (autoservicio). Roles staff se crean por SQL/admin, no aquí. */
  async registrar(datos: RegistroDatos) {
    const resultado = await this.supabase.auth.signUp({
      email: datos.email,
      password: datos.password,
      options: {
        data: { nombre: datos.nombre, telefono: datos.telefono },
      },
    });
    // Sin confirmación por correo el alta ya trae sesión: cargamos rol/cliente
    // antes de que el registro navegue a una ruta protegida (ej. checkout).
    if (resultado.data.session) {
      await this.cargarRolYCliente(resultado.data.session);
    }
    return resultado;
  }

  async iniciarSesion(email: string, password: string) {
    const resultado = await this.supabase.auth.signInWithPassword({ email, password });
    if (resultado.data.session) {
      await this.cargarRolYCliente(resultado.data.session);
    }
    return { ...resultado, rol: this._rol() };
  }

  async cerrarSesion() {
    await this.supabase.auth.signOut();
  }
}
