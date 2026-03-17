import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { TecnicaDTO, TecnicaGrupo, CrearTecnicaRequest, GRUPO_TECNICA_CONFIG, GrupoTecnica } from '../models';

@Injectable({ providedIn: 'root' })
export class TecnicaService extends BaseHttpService {
  private readonly BASE_URL = '/api/tecnicas';

  private cache$: Observable<TecnicaGrupo[]> | null = null;

  constructor(http: HttpClient) {
    super(http);
  }

  /** Técnicas activas agrupadas para p-multiselect — con caché para evitar llamadas duplicadas */
  obtenerTecnicasAgrupadas(): Observable<TecnicaGrupo[]> {
    if (!this.cache$) {
      this.cache$ = this.get<TecnicaDTO[]>(this.BASE_URL).pipe(
        map(tecnicas => this.agrupar(tecnicas)),
        catchError(err => { this.cache$ = null; return throwError(() => err); }),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  /** Todas las técnicas (activas e inactivas) para la pantalla del coordinador */
  obtenerTodas(): Observable<TecnicaDTO[]> {
    return this.get<TecnicaDTO[]>(`${this.BASE_URL}/todos`);
  }

  crearTecnica(request: CrearTecnicaRequest): Observable<TecnicaDTO> {
    return this.post<TecnicaDTO>(this.BASE_URL, request);
  }

  actualizarTecnica(id: number, request: CrearTecnicaRequest): Observable<TecnicaDTO> {
    return this.put<TecnicaDTO>(`${this.BASE_URL}/${id}`, request);
  }

  toggleActivo(id: number): Observable<TecnicaDTO> {
    return this.patch<TecnicaDTO>(`${this.BASE_URL}/${id}/toggle`, {});
  }

  /** Invalida el caché (llamar después de crear/editar/toggle desde el coordinador) */
  invalidarCache(): void {
    this.cache$ = null;
  }

  private agrupar(tecnicas: TecnicaDTO[]): TecnicaGrupo[] {
    const orden: GrupoTecnica[] = ['ALUMNO_NO_INTERVIENE', 'ALUMNO_PARTICIPA'];
    return orden.map(grupo => ({
      label: GRUPO_TECNICA_CONFIG[grupo].label,
      icon:  GRUPO_TECNICA_CONFIG[grupo].icon,
      items: tecnicas
        .filter(t => t.grupo === grupo)
        .map(t => ({ label: t.label, value: t.value }))
    })).filter(g => g.items.length > 0);
  }
}
