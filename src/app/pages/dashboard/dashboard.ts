import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';
import { Router } from '@angular/router';
import { NotificationsWidget } from './components/notificaciones/notificationswidget';
import { TimelineWidget } from './components/linea-tiempo/timelinewidget';
import { Generalprogresswidget } from './components/barra-progreso-general/generalprogresswidget';
import { ModuleProgressWidget } from './components/progreso-por-modulos/moduleprogresswidget';
import { StudentProgressSummary } from './components/progreso-estudiantes/student-progress-summary';
import { BitacoraService } from '../../core/services/bitacora.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { TutorEstudianteService } from '../../core/services/tutor-estudiante.service';
import { TutorReviewService } from '../../core/services/tutor-review.service';
import { ConfiguracionService } from '../../core/services/configuracion.service';
import { RespuestaSeccionDTO, TutorEstudianteDTO, UserRole } from '../../core/models';
import { EstudianteProgresoResumenDTO, ProgresoSeccionDTO } from '../../core/models/estudiante-progreso.model';

const TOTAL_MODULOS = 8;

@Component({
  selector: 'app-dashboard',
  imports: [NotificationsWidget, TimelineWidget, Generalprogresswidget, ModuleProgressWidget, StudentProgressSummary, FieldsetModule],
  templateUrl: 'dashboard.html'
})
export class Dashboard implements OnInit {
  private bitacoraService = inject(BitacoraService);
  private authStateService = inject(AuthStateService);
  private tutorEstudianteService = inject(TutorEstudianteService);
  private tutorReviewService = inject(TutorReviewService);
  private configuracionService = inject(ConfiguracionService);
  private router = inject(Router);

  readonly totalModulos = TOTAL_MODULOS;

  secciones: Record<string, RespuestaSeccionDTO> = {};
  userRole = 1;
  tutorAsignado = signal<TutorEstudianteDTO | null>(null);
  cargandoTutor = signal(true);

  progresoRevision = signal<EstudianteProgresoResumenDTO | null>(null);
  umbralProgreso = signal(80);

  progresoSecciones = computed<Record<string, ProgresoSeccionDTO>>(() =>
    this.progresoRevision()?.secciones ?? {}
  );

  modulosRevisados = computed(() => {
    const secs = this.progresoRevision()?.secciones ?? {};
    return Object.values(secs).filter(s => s.revisado === true).length;
  });

  porcentajeRevisado = computed(() =>
    Math.round((this.modulosRevisados() / TOTAL_MODULOS) * 100)
  );

  ngOnInit(): void {
    const user = this.authStateService.getUserData();
    if (user) {
      this.userRole = user.role ?? user.roles[0] ?? 1;
    }

    if (this.authStateService.hasRole(UserRole.COORDINADOR)) {
      this.router.navigate(['/home/coordinador/dashboard']);
      return;
    }

    this.configuracionService.obtenerConfiguracion('UMBRAL_PROGRESO_NOTIFICACION').subscribe({
      next: (cfg) => this.umbralProgreso.set(parseInt(cfg.valor) || 80),
      error: () => {}
    });

    if (this.authStateService.hasRole(UserRole.ESTUDIANTE)) {
      this.bitacoraService.obtenerTodasSecciones().subscribe({
        next: (data) => this.secciones = data
      });

      const estudianteId = user?.id;
      if (estudianteId) {
        this.tutorEstudianteService.obtenerTutorPorEstudiante(estudianteId).subscribe({
          next: (data) => { this.tutorAsignado.set(data); this.cargandoTutor.set(false); },
          error: () => { this.tutorAsignado.set(null); this.cargandoTutor.set(false); }
        });

        this.tutorReviewService.obtenerProgresoIndividual(estudianteId).subscribe({
          next: (data) => this.progresoRevision.set(data),
          error: () => this.progresoRevision.set(null)
        });
      } else {
        this.cargandoTutor.set(false);
      }
    }
  }

  getIniciales(nombre: string): string {
    const partes = nombre.trim().split(' ');
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : nombre.substring(0, 2).toUpperCase();
  }
}
