import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { InstrumentoDTO, CrearInstrumentoRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class InstrumentoService extends BaseHttpService {
  private readonly BASE_URL = '/api/instrumentos';

  private cache$: Observable<InstrumentoDTO[]> | null = null;

  constructor(http: HttpClient) {
    super(http);
  }

  /** Instrumentos activos para p-multiselect — con caché para evitar llamadas duplicadas */
  obtenerInstrumentos(): Observable<InstrumentoDTO[]> {
    if (!this.cache$) {
      this.cache$ = this.get<InstrumentoDTO[]>(this.BASE_URL).pipe(
        catchError(err => { this.cache$ = null; return throwError(() => err); }),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  /** Todos los instrumentos (activos e inactivos) para la pantalla del coordinador */
  obtenerTodos(): Observable<InstrumentoDTO[]> {
    return this.get<InstrumentoDTO[]>(`${this.BASE_URL}/todos`);
  }

  crearInstrumento(request: CrearInstrumentoRequest): Observable<InstrumentoDTO> {
    return this.post<InstrumentoDTO>(this.BASE_URL, request);
  }

  actualizarInstrumento(id: number, request: CrearInstrumentoRequest): Observable<InstrumentoDTO> {
    return this.put<InstrumentoDTO>(`${this.BASE_URL}/${id}`, request);
  }

  toggleActivo(id: number): Observable<InstrumentoDTO> {
    return this.patch<InstrumentoDTO>(`${this.BASE_URL}/${id}/toggle`, {});
  }

  /** Invalida el caché (llamar después de crear/editar/toggle desde el coordinador) */
  invalidarCache(): void {
    this.cache$ = null;
  }
}
