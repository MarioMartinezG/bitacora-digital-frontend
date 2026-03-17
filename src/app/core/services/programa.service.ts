import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { ProgramaDTO, CrearProgramaRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ProgramaService extends BaseHttpService {
  private readonly BASE_URL = '/api/programas';

  constructor(http: HttpClient) {
    super(http);
  }

  obtenerProgramas(): Observable<ProgramaDTO[]> {
    return this.get<ProgramaDTO[]>(this.BASE_URL);
  }

  crearPrograma(request: CrearProgramaRequest): Observable<ProgramaDTO> {
    return this.post<ProgramaDTO>(this.BASE_URL, request);
  }

  actualizarPrograma(id: number, request: CrearProgramaRequest): Observable<ProgramaDTO> {
    return this.put<ProgramaDTO>(`${this.BASE_URL}/${id}`, request);
  }

  eliminarPrograma(id: number): Observable<void> {
    return this.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
