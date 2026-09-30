import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { UsuariosAdminService } from '../../../core/admin/usuarios-admin.service';
import { ROLE_LABELS, Rol } from '../../../core/models/roles';
import type { Enums } from '../../../core/models/database.types';

import { PageHeader } from '../../../shared/ui/page-header/page-header';

/** Orden en que se muestran las opciones del selector de rol. */
const ORDEN_ROLES: Rol[] = ['cliente', 'vendedor', 'admin'];

@Component({
  selector: 'app-admin-usuarios',
  imports: [PageHeader],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosAdmin implements OnInit {
  private usuariosSvc = inject(UsuariosAdminService);
  readonly auth = inject(AuthService);

  usuarios = signal<Awaited<ReturnType<UsuariosAdminService['listar']>>>([]);
  roles = signal<{ id: string; nombre: Rol }[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  guardandoId = signal<string | null>(null);

  readonly ROLE_LABELS = ROLE_LABELS;

  async ngOnInit() {
    const [usuarios, roles] = await Promise.all([
      this.usuariosSvc.listar(),
      this.usuariosSvc.listarRoles(),
    ]);
    this.usuarios.set(usuarios);
    this.roles.set(
      [...roles].sort((a, b) => ORDEN_ROLES.indexOf(a.nombre) - ORDEN_ROLES.indexOf(b.nombre)),
    );
    this.cargando.set(false);
  }

  async cambiarRol(usuarioId: string, rolId: string) {
    await this.guardar(usuarioId, () => this.usuariosSvc.cambiarRol(usuarioId, rolId));
  }

  async cambiarEstado(usuarioId: string, estado: Enums<'estado_usuario_enum'>) {
    await this.guardar(usuarioId, () => this.usuariosSvc.cambiarEstado(usuarioId, estado));
  }

  private async guardar(usuarioId: string, accion: () => Promise<void>) {
    this.error.set(null);
    this.guardandoId.set(usuarioId);
    try {
      await accion();
    } catch (e) {
      // PostgrestError no hereda de Error, pero trae `message`.
      this.error.set((e as { message?: string })?.message ?? 'No se pudo guardar el cambio.');
    } finally {
      // Siempre recargar: si falló, el selector vuelve al valor real de la BD.
      this.usuarios.set(await this.usuariosSvc.listar());
      this.guardandoId.set(null);
    }
  }
}
