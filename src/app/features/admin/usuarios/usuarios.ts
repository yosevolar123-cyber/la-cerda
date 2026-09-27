import { Component, OnInit, inject, signal } from '@angular/core';
import { UsuariosAdminService } from '../../../core/admin/usuarios-admin.service';
import { ROLE_LABELS, Rol } from '../../../core/models/roles';
import type { Enums } from '../../../core/models/database.types';

import { PageHeader } from '../../../shared/ui/page-header/page-header';

@Component({
  selector: 'app-admin-usuarios',
  imports: [PageHeader],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosAdmin implements OnInit {
  private usuariosSvc = inject(UsuariosAdminService);

  usuarios = signal<Awaited<ReturnType<UsuariosAdminService['listar']>>>([]);
  roles = signal<{ id: string; nombre: Rol }[]>([]);
  cargando = signal(true);

  readonly ROLE_LABELS = ROLE_LABELS;

  async ngOnInit() {
    const [usuarios, roles] = await Promise.all([
      this.usuariosSvc.listar(),
      this.usuariosSvc.listarRoles(),
    ]);
    this.usuarios.set(usuarios);
    this.roles.set(roles);
    this.cargando.set(false);
  }

  async cambiarRol(usuarioId: string, rolId: string) {
    await this.usuariosSvc.cambiarRol(usuarioId, rolId);
    this.usuarios.set(await this.usuariosSvc.listar());
  }

  async cambiarEstado(usuarioId: string, estado: Enums<'estado_usuario_enum'>) {
    await this.usuariosSvc.cambiarEstado(usuarioId, estado);
    this.usuarios.set(await this.usuariosSvc.listar());
  }
}
