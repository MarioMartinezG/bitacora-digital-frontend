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
import { Asignatura } from '../../../core/models';
import { AsignaturasService } from '../../../core/services/asignaturas.service';

@Component({
  selector: 'app-asignaturas-list',
  templateUrl: './asignaturas-list.html',
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
export class AsignaturasList implements OnInit {
  asignaturas = signal<Asignatura[]>([]);
  cargando = signal(false);

  constructor(
    private router: Router,
    private asignaturasService: AsignaturasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadAsignaturas();
  }

  loadAsignaturas(): void {
    this.cargando.set(true);
    this.asignaturasService.listarAsignaturas().subscribe({
      next: (data) => {
        this.asignaturas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las asignaturas',
          life: 3000
        });
      }
    });
  }

  nuevaAsignatura(): void {
    this.router.navigate(['/home/coordinador/asignaturas/nueva']);
  }

  verDetalle(asignatura: Asignatura): void {
    this.router.navigate(['/home/coordinador/asignaturas', asignatura.id]);
  }

  editarAsignatura(asignatura: Asignatura): void {
    this.router.navigate(['/home/coordinador/asignaturas', asignatura.id, 'editar']);
  }

  confirmarToggleActiva(asignatura: Asignatura): void {
    const accion = asignatura.activa ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Deseas ${accion} la asignatura "${asignatura.nombre}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.toggleActiva(asignatura)
    });
  }

  private toggleActiva(asignatura: Asignatura): void {
    this.asignaturasService.actualizarAsignatura(asignatura.id, { activa: !asignatura.activa }).subscribe({
      next: (updated) => {
        this.asignaturas.update(list =>
          list.map(a => a.id === asignatura.id ? updated : a)
        );
        const accion = !asignatura.activa ? 'activada' : 'desactivada';
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: `Asignatura ${accion} correctamente`,
          life: 3000
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la asignatura',
          life: 3000
        });
      }
    });
  }

  getEstadoSeverity(activa: boolean): 'success' | 'danger' {
    return activa ? 'success' : 'danger';
  }

  formatFecha(fecha?: string): string {
    if (!fecha) return 'Sin registro';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
