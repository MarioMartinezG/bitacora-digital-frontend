import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { MomentoDTO, CrearMomentoRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class MomentoService extends BaseHttpService {
  private readonly BASE_URL = '/api/momentos';

  constructor(http: HttpClient) {
    super(http);
  }

  obtenerMomentos(): Observable<MomentoDTO[]> {
    return this.get<MomentoDTO[]>(this.BASE_URL);
  }

  obtenerMomento(id: number): Observable<MomentoDTO> {
    return this.get<MomentoDTO>(`${this.BASE_URL}/${id}`);
  }

  crearMomento(request: CrearMomentoRequest): Observable<MomentoDTO> {
    return this.post<MomentoDTO>(this.BASE_URL, request);
  }

  actualizarMomento(id: number, request: CrearMomentoRequest): Observable<MomentoDTO> {
    return this.put<MomentoDTO>(`${this.BASE_URL}/${id}`, request);
  }

  eliminarMomento(id: number): Observable<void> {
    return this.delete<void>(`${this.BASE_URL}/${id}`);
  }
}
