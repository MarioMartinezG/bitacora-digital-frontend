import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { DimensionDTO, CrearDimensionRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class DimensionService extends BaseHttpService {
  private readonly BASE_URL = '/api/dimensiones';

  private cache$: Observable<DimensionDTO[]> | null = null;

  constructor(http: HttpClient) {
    super(http);
  }

  /** Dimensiones activas para p-select — con caché para evitar llamadas duplicadas */
  obtenerDimensiones(): Observable<DimensionDTO[]> {
    if (!this.cache$) {
      this.cache$ = this.get<DimensionDTO[]>(this.BASE_URL).pipe(
        catchError(err => { this.cache$ = null; return throwError(() => err); }),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  /** Todas las dimensiones (activas e inactivas) para la pantalla del coordinador */
  obtenerTodas(): Observable<DimensionDTO[]> {
    return this.get<DimensionDTO[]>(`${this.BASE_URL}/todos`);
  }

  crearDimension(request: CrearDimensionRequest): Observable<DimensionDTO> {
    return this.post<DimensionDTO>(this.BASE_URL, request);
  }

  actualizarDimension(id: number, request: CrearDimensionRequest): Observable<DimensionDTO> {
    return this.put<DimensionDTO>(`${this.BASE_URL}/${id}`, request);
  }

  toggleActivo(id: number): Observable<DimensionDTO> {
    return this.patch<DimensionDTO>(`${this.BASE_URL}/${id}/toggle`, {});
  }

  /** Invalida el caché (llamar después de crear/editar/toggle desde el coordinador) */
  invalidarCache(): void {
    this.cache$ = null;
  }
}
