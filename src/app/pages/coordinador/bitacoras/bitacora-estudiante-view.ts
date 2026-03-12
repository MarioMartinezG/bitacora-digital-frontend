import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBar } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { getSeverityByEstado, getLabelByEstado, EstadoAvance, calcularEstadoAvance } from '../../../core/models';
import { TutorReviewService } from '../../../core/services/tutor-review.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { forkJoin } from 'rxjs';

interface SeccionInfo {
  codigo: string;
  nombre: string;
  porcentaje: number;
  estado: EstadoAvance;
}

const SECCIONES_BITACORA: { codigo: string; nombre: string }[] = [
  { codigo: 'caracteriza', nombre: 'Identificación de tu curso' },
  { codigo: 'factores', nombre: 'Factores Situacionales' },
  { codigo: 'ajustes', nombre: 'Ambientes Sanos y Seguros' },
  { codigo: 'rap-rac', nombre: 'RAP y RAC' },
  { codigo: 'actividades', nombre: 'Actividades de Aprendizaje' },
  { codigo: 'evaluacion', nombre: 'Diseño de la evaluación' },
  { codigo: 'secuencia', nombre: 'Secuencia del Curso' },
  { codigo: 'bibliografia', nombre: 'Bibliografía' },
  { codigo: 'calificacion', nombre: 'Calificación' }
];

@Component({
  selector: 'app-bitacora-estudiante-view',
  templateUrl: './bitacora-estudiante-view.html',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, ProgressBar, SkeletonModule, ToastModule],
  providers: [MessageService]
})
export class BitacoraEstudianteView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tutorReviewService = inject(TutorReviewService);
  private usuariosService = inject(UsuariosService);
  private messageService = inject(MessageService);

  nombreEstudiante = signal<string>('');
  correoEstudiante = signal<string>('');
  secciones = signal<SeccionInfo[]>([]);
  cargando = signal(true);
  getSeverity = getSeverityByEstado;
  getLabel = getLabelByEstado;

  ngOnInit(): void {
    const estudianteId = Number(this.route.snapshot.paramMap.get('estudianteId'));
    this.cargarDatos(estudianteId);
  }

  private cargarDatos(estudianteId: number): void {
    forkJoin({
      usuario: this.usuariosService.obtenerUsuario(estudianteId),
      progreso: this.tutorReviewService.obtenerProgresoIndividual(estudianteId)
    }).subscribe({
      next: ({ usuario, progreso }) => {
        this.nombreEstudiante.set(usuario.nombre);
        this.correoEstudiante.set(usuario.correo);

        this.secciones.set(SECCIONES_BITACORA.map(s => {
          const seccionProgreso = progreso.secciones?.[s.codigo];
          const porcentaje = seccionProgreso?.porcentaje ?? 0;
          return {
            ...s,
            porcentaje,
            estado: calcularEstadoAvance(porcentaje)
          };
        }));

        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la información del estudiante'
        });
      }
    });
  }

  verSeccion(seccionCodigo: string): void {
    const estudianteId = this.route.snapshot.paramMap.get('estudianteId');
    this.router.navigate(['/home/coordinador/bitacoras', estudianteId, 'seccion', seccionCodigo]);
  }

  volver(): void {
    this.router.navigate(['/home/coordinador/bitacoras']);
  }
}
