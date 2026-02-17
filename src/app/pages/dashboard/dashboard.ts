import { Component, OnInit, inject } from '@angular/core';
import { NotificationsWidget } from './components/notificaciones/notificationswidget';
import { TimelineWidget } from './components/linea-tiempo/timelinewidget';
import { Generalprogresswidget } from './components/barra-progreso-general/generalprogresswidget';
import { ModuleProgressWidget } from './components/progreso-por-modulos/moduleprogresswidget';
import { StudentProgressSummary } from './components/progreso-estudiantes/student-progress-summary';
import { BitacoraService } from '../../core/services/bitacora.service';
import { LoginService } from '../../core/services/login.service';
import { RespuestaSeccionDTO } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [NotificationsWidget, TimelineWidget, Generalprogresswidget, ModuleProgressWidget, StudentProgressSummary],
  templateUrl: 'dashboard.html'
})
export class Dashboard implements OnInit {
  private bitacoraService = inject(BitacoraService);
  private loginService = inject(LoginService);

  secciones: Record<string, RespuestaSeccionDTO> = {};
  userRole = 1;

  ngOnInit(): void {
    const userData = this.loginService.getUser();
    if (userData) {
      const user = JSON.parse(userData);
      this.userRole = user.role;
    }

    if (this.userRole === 1) {
      this.bitacoraService.obtenerTodasSecciones().subscribe({
        next: (data) => this.secciones = data
      });
    }
  }
}
