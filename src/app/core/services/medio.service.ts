import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { MedioDTO, MedioGrupo, CrearMedioRequest, CATEGORIA_MEDIO_CONFIG, CategoriaMedio } from '../models';

@Injectable({ providedIn: 'root' })
export class MedioService extends BaseHttpService {
  private readonly BASE_URL = '/api/medios';

  private cache$: Observable<MedioGrupo[]> | null = null;

  constructor(http: HttpClient) {
    super(http);
  }

  /** Medios activos agrupados para p-multiselect — con caché para evitar llamadas duplicadas */
  obtenerMediosAgrupados(): Observable<MedioGrupo[]> {
    if (!this.cache$) {
      this.cache$ = this.get<MedioDTO[]>(this.BASE_URL).pipe(
        map(medios => this.agrupar(medios)),
        catchError(err => { this.cache$ = null; return throwError(() => err); }),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  /** Todos los medios (activos e inactivos) para la pantalla del coordinador */
  obtenerTodos(): Observable<MedioDTO[]> {
    return this.get<MedioDTO[]>(`${this.BASE_URL}/todos`);
  }

  crearMedio(request: CrearMedioRequest): Observable<MedioDTO> {
    return this.post<MedioDTO>(this.BASE_URL, request);
  }

  actualizarMedio(id: number, request: CrearMedioRequest): Observable<MedioDTO> {
    return this.put<MedioDTO>(`${this.BASE_URL}/${id}`, request);
  }

  toggleActivo(id: number): Observable<MedioDTO> {
    return this.patch<MedioDTO>(`${this.BASE_URL}/${id}/toggle`, {});
  }

  /** Invalida el caché (llamar después de crear/editar/toggle desde el coordinador) */
  invalidarCache(): void {
    this.cache$ = null;
  }

  private agrupar(medios: MedioDTO[]): MedioGrupo[] {
    const orden: CategoriaMedio[] = ['ESCRITOS', 'ORALES', 'PRACTICOS'];
    return orden.map(cat => ({
      label: CATEGORIA_MEDIO_CONFIG[cat].label,
      icon:  CATEGORIA_MEDIO_CONFIG[cat].icon,
      items: medios
        .filter(m => m.categoria === cat)
        .map(m => ({ label: m.label, value: m.value }))
    })).filter(g => g.items.length > 0);
  }
}
