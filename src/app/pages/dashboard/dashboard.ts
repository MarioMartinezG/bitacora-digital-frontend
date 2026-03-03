import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationsWidget } from './components/notificaciones/notificationswidget';
import { TimelineWidget } from './components/linea-tiempo/timelinewidget';
import { Generalprogresswidget } from './components/barra-progreso-general/generalprogresswidget';
import { ModuleProgressWidget } from './components/progreso-por-modulos/moduleprogresswidget';
import { StudentProgressSummary } from './components/progreso-estudiantes/student-progress-summary';
import { BitacoraService } from '../../core/services/bitacora.service';
import { AuthStateService } from '../../core/services/auth-state.service';
import { RespuestaSeccionDTO, UserRole } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [NotificationsWidget, TimelineWidget, Generalprogresswidget, ModuleProgressWidget, StudentProgressSummary],
  templateUrl: 'dashboard.html'
})
export class Dashboard implements OnInit {
  private bitacoraService = inject(BitacoraService);
  private authStateService = inject(AuthStateService);
  private router = inject(Router);

  secciones: Record<string, RespuestaSeccionDTO> = {};
  userRole = 1;

  ngOnInit(): void {
    const user = this.authStateService.getUserData();
    if (user) {
      this.userRole = user.role ?? user.roles[0] ?? 1;
    }

    // Si es coordinador, redirigir a su dashboard
    if (this.authStateService.hasRole(UserRole.COORDINADOR)) {
      this.router.navigate(['/home/coordinador/dashboard']);
      return;
    }

    if (this.authStateService.hasRole(UserRole.ESTUDIANTE)) {
      this.bitacoraService.obtenerTodasSecciones().subscribe({
        next: (data) => this.secciones = data
      });
    }
  }
}
