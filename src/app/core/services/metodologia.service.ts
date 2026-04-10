import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { MetodologiaDTO, CrearMetodologiaRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class MetodologiaService extends BaseHttpService {
  private readonly BASE_URL = '/api/metodologias';

  private cache$: Observable<MetodologiaDTO[]> | null = null;

  constructor(http: HttpClient) {
    super(http);
  }

  /** Metodologías activas para p-select — con caché para evitar llamadas duplicadas */
  obtenerMetodologias(): Observable<MetodologiaDTO[]> {
    if (!this.cache$) {
      this.cache$ = this.get<MetodologiaDTO[]>(this.BASE_URL).pipe(
        catchError(err => { this.cache$ = null; return throwError(() => err); }),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  /** Todas las metodologías (activas e inactivas) para la pantalla del coordinador */
  obtenerTodas(): Observable<MetodologiaDTO[]> {
    return this.get<MetodologiaDTO[]>(`${this.BASE_URL}/todos`);
  }

  crearMetodologia(request: CrearMetodologiaRequest): Observable<MetodologiaDTO> {
    return this.post<MetodologiaDTO>(this.BASE_URL, request);
  }

  actualizarMetodologia(id: number, request: CrearMetodologiaRequest): Observable<MetodologiaDTO> {
    return this.put<MetodologiaDTO>(`${this.BASE_URL}/${id}`, request);
  }

  toggleActivo(id: number): Observable<MetodologiaDTO> {
    return this.patch<MetodologiaDTO>(`${this.BASE_URL}/${id}/toggle`, {});
  }

  /** Invalida el caché (llamar después de crear/editar/toggle desde el coordinador) */
  invalidarCache(): void {
    this.cache$ = null;
  }
}
