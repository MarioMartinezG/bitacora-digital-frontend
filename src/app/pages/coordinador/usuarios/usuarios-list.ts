import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Usuario } from '../../../core/models';
import { UserRole, ROLE_LABELS } from '../../../core/models/role.model';
import { UsuariosService } from '../../../core/services/usuarios.service';

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.html',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class UsuariosList implements OnInit {
  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);

  constructor(
    private router: Router,
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.cargando.set(true);
    this.usuariosService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios',
          life: 3000
        });
      }
    });
  }

  nuevoUsuario(): void {
    this.router.navigate(['/home/coordinador/usuarios/nuevo']);
  }

  verDetalle(usuario: Usuario): void {
    this.router.navigate(['/home/coordinador/usuarios', usuario.id]);
  }

  editarUsuario(usuario: Usuario): void {
    this.router.navigate(['/home/coordinador/usuarios', usuario.id, 'editar']);
  }

  confirmarToggleActivo(usuario: Usuario): void {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Deseas ${accion} al usuario ${usuario.nombre}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.toggleActivo(usuario);
      }
    });
  }

  private toggleActivo(usuario: Usuario): void {
    this.usuariosService.toggleActivo(usuario.id).subscribe({
      next: () => {
        const accion = !usuario.activo ? 'activado' : 'desactivado';
        this.usuarios.update(list =>
          list.map(u => u.id === usuario.id ? { ...u, activo: !u.activo } : u)
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: `Usuario ${accion} correctamente`,
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

  getEstadoSeverity(activo: boolean): "success" | "danger" {
    return activo ? 'success' : 'danger';
  }

  formatFecha(fecha?: string): string {
    if (!fecha) return 'Sin registro';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
