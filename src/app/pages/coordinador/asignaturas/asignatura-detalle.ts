import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Asignatura } from '../../../core/models';
import { AsignaturasService } from '../../../core/services/asignaturas.service';

@Component({
  selector: 'app-asignatura-detalle',
  templateUrl: './asignatura-detalle.html',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    TagModule,
    SkeletonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class AsignaturaDetalle implements OnInit {
  asignatura = signal<Asignatura | null>(null);
  cargando = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private asignaturasService: AsignaturasService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAsignatura(Number(id));
    }
  }

  private loadAsignatura(id: number): void {
    this.cargando.set(true);
    this.asignaturasService.obtenerAsignatura(id).subscribe({
      next: (data) => {
        this.asignatura.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la asignatura',
          life: 3000
        });
      }
    });
  }

  editar(): void {
    const a = this.asignatura();
    if (a) this.router.navigate(['/home/coordinador/asignaturas', a.id, 'editar']);
  }

  volver(): void {
    this.router.navigate(['/home/coordinador/asignaturas']);
  }

  getEstadoSeverity(activa: boolean): 'success' | 'danger' {
    return activa ? 'success' : 'danger';
  }

  formatFecha(fecha?: string): string {
    if (!fecha) return 'Sin registro';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
