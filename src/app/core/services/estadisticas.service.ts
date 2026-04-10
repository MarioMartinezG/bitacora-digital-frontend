import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { EstadisticasGenerales, AlertaSistema, ReporteProgreso } from '../models';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService extends BaseHttpService {
  private readonly BASE_URL = '/api/coordinador/estadisticas';

  constructor(http: HttpClient) {
    super(http);
  }

  obtenerEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    return this.get<EstadisticasGenerales>(this.BASE_URL);
  }

  obtenerAlertas(): Observable<AlertaSistema[]> {
    return this.get<AlertaSistema[]>(`${this.BASE_URL}/alertas`);
  }

  resolverAlerta(alertaId: number): Observable<void> {
    return this.patch<void>(`${this.BASE_URL}/alertas/${alertaId}/resolver`, {});
  }

  obtenerReportesProgreso(asignaturaId?: number, tutorId?: number): Observable<ReporteProgreso[]> {
    let params = new HttpParams();
    if (asignaturaId) params = params.set('asignaturaId', String(asignaturaId));
    if (tutorId) params = params.set('tutorId', String(tutorId));
    return this.get<ReporteProgreso[]>('/api/coordinador/reportes/progreso', { params });
  }
}
