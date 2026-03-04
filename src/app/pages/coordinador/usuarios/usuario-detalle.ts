import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Usuario } from '../../../core/models';
import { UserRole, ROLE_LABELS } from '../../../core/models/role.model';
import { UsuariosService } from '../../../core/services/usuarios.service';

@Component({
  selector: 'app-usuario-detalle',
  templateUrl: './usuario-detalle.html',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class UsuarioDetalle implements OnInit {
  usuario = signal<Usuario | null>(null);
  cargando = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUsuario(Number(id));
    }
  }

  private loadUsuario(id: number): void {
    this.cargando.set(true);
    this.usuariosService.obtenerUsuario(id).subscribe({
      next: (usuario) => {
        this.usuario.set(usuario);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el usuario',
          life: 3000
        });
      }
    });
  }

  editarUsuario(): void {
    const u = this.usuario();
    if (u) {
      this.router.navigate(['/home/coordinador/usuarios', u.id, 'editar']);
    }
  }

  confirmarToggleActivo(): void {
    const u = this.usuario();
    if (!u) return;

    const accion = u.activo ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Deseas ${accion} al usuario ${u.nombre}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.usuariosService.toggleActivo(u.id).subscribe({
          next: () => {
            const accionPasada = !u.activo ? 'activado' : 'desactivado';
            this.usuario.set({ ...u, activo: !u.activo });
            this.messageService.add({
              severity: 'success',
              summary: 'Actualizado',
              detail: `Usuario ${accionPasada} correctamente`,
              life: 3000
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar el usuario',
              life: 3000
            });
          }
        });
      }
    });
  }

  volver(): void {
    this.router.navigate(['/home/coordinador/usuarios']);
  }

  getRolLabel(rolId: number): string {
    return ROLE_LABELS[rolId as UserRole] || 'Desconocido';
  }

  getRolSeverity(rolId: number): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" {
    switch (rolId) {
      case UserRole.ESTUDIANTE: return 'info';
      case UserRole.TUTOR: return 'success';
      case UserRole.COORDINADOR: return 'warn';
      default: return 'secondary';
    }
  }

  formatFecha(fecha?: string): string {
    if (!fecha) return 'Sin registro';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
