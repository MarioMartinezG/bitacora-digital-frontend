import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import {
  Asignatura,
  CreateAsignaturaRequest,
  UpdateAsignaturaRequest,
  AsignarEstudiantesRequest,
  AsignarTutoresRequest
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class AsignaturasService extends BaseHttpService {
  private readonly BASE_URL = '/api/coordinador/asignaturas';

  constructor(http: HttpClient) {
    super(http);
  }

  listarAsignaturas(activas?: boolean): Observable<Asignatura[]> {
    let params = new HttpParams();
    if (activas !== undefined) params = params.set('activas', String(activas));
    return this.get<Asignatura[]>(this.BASE_URL, { params });
  }

  obtenerAsignatura(id: number): Observable<Asignatura> {
    return this.get<Asignatura>(`${this.BASE_URL}/${id}`);
  }

  crearAsignatura(data: CreateAsignaturaRequest): Observable<Asignatura> {
    return this.post<Asignatura>(this.BASE_URL, data);
  }

  actualizarAsignatura(id: number, data: UpdateAsignaturaRequest): Observable<Asignatura> {
    return this.put<Asignatura>(`${this.BASE_URL}/${id}`, data);
  }

  eliminarAsignatura(id: number): Observable<void> {
    return this.delete<void>(`${this.BASE_URL}/${id}`);
  }

  asignarEstudiantes(asignaturaId: number, data: AsignarEstudiantesRequest): Observable<void> {
    return this.post<void>(`${this.BASE_URL}/${asignaturaId}/estudiantes`, data);
  }

  removerEstudiante(asignaturaId: number, estudianteId: number): Observable<void> {
    return this.delete<void>(`${this.BASE_URL}/${asignaturaId}/estudiantes/${estudianteId}`);
  }

  asignarTutores(asignaturaId: number, data: AsignarTutoresRequest): Observable<void> {
    return this.post<void>(`${this.BASE_URL}/${asignaturaId}/tutores`, data);
  }

  removerTutor(asignaturaId: number, tutorId: number): Observable<void> {
    return this.delete<void>(`${this.BASE_URL}/${asignaturaId}/tutores/${tutorId}`);
  }
}
