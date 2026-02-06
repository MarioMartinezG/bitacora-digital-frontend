import { Component, OnInit, inject } from '@angular/core';
import { NotificationsWidget } from './components/notificaciones/notificationswidget';
import { TimelineWidget } from './components/linea-tiempo/timelinewidget';
import { Generalprogresswidget } from './components/barra-progreso-general/generalprogresswidget';
import { ModuleProgressWidget } from './components/progreso-por-modulos/moduleprogresswidget';
import { BitacoraService } from '../../core/services/bitacora.service';
import { RespuestaSeccionDTO } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  imports: [NotificationsWidget, TimelineWidget, Generalprogresswidget, ModuleProgressWidget],
  templateUrl: 'dashboard.html'
})
export class Dashboard implements OnInit {
  private bitacoraService = inject(BitacoraService);

  secciones: Record<string, RespuestaSeccionDTO> = {};

  ngOnInit(): void {
    this.bitacoraService.obtenerTodasSecciones().subscribe({
      next: (data) => this.secciones = data
    });
  }
}
