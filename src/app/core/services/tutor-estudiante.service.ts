import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { TutorEstudianteDTO, AsignarTutorRequest } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TutorEstudianteService extends BaseHttpService {
  private readonly BASE_URL = '/api/tutor-estudiante';

  constructor(http: HttpClient) {
    super(http);
  }

  obtenerTodasAsignaciones(): Observable<TutorEstudianteDTO[]> {
    return this.get<TutorEstudianteDTO[]>(`${this.BASE_URL}/asignaciones`);
  }

  asignarTutor(request: AsignarTutorRequest): Observable<TutorEstudianteDTO> {
    return this.post<TutorEstudianteDTO>(`${this.BASE_URL}/asignar`, request);
  }

  asignarAleatorio(): Observable<TutorEstudianteDTO[]> {
    return this.post<TutorEstudianteDTO[]>(`${this.BASE_URL}/asignar-aleatorio`, {});
  }

  obtenerEstudiantesPorTutor(tutorId: number): Observable<TutorEstudianteDTO[]> {
    return this.get<TutorEstudianteDTO[]>(`${this.BASE_URL}/tutor/${tutorId}/estudiantes`);
  }

  obtenerTutorPorEstudiante(estudianteId: number): Observable<TutorEstudianteDTO> {
    return this.get<TutorEstudianteDTO>(`${this.BASE_URL}/estudiante/${estudianteId}/tutor`);
  }

  desactivarAsignacion(id: number): Observable<void> {
    return this.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
