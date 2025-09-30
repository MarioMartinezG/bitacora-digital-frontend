import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { MenuItem } from 'primeng/api';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiError } from '../models/api-response';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private http = inject(HttpClient);

  private mockMenuEstudiante: MenuItem[] = [
    {
      label: 'Inicio',
      items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-clipboard', routerLink: ['/home'] }]
    },
    {
      label: 'Bitácora Digital',
      items: [
        { label: 'Caracteriza tu Asignatura', icon: 'pi pi-fw pi-id-card', routerLink: ['/home/bitacora/caracteriza-asignatura'] },
        { label: 'Factores Situacionales', icon: 'pi pi-fw pi-arrow-up-right-and-arrow-down-left-from-center', routerLink: ['/home/bitacora/factores-situacionales'] },
        { label: 'Ambientes Sanos y seguros para el aprendizaje', icon: 'pi pi-fw pi-wrench', class: 'rotated-icon', routerLink: ['/home/bitacora/ajustes-razonables'] },
        { label: 'RAP y RAC', icon: 'pi pi-fw pi-table', routerLink: ['/home/bitacora/rap-rac'] },
        { label: 'Actividades de Aprendizaje', icon: 'pi pi-fw pi-list', routerLink: ['/home/bitacora/actividades-aprendizaje'] },
        { label: 'Cómo Evaluaré', icon: 'pi pi-fw pi-trophy', routerLink: ['/home/bitacora/como-evaluare'] },
        { label: 'Secuencia del Curso', icon: 'pi pi-fw pi-angle-double-right', routerLink: ['/home/bitacora/secuencia-curso'] },
        { label: 'Bibliografía y medios educativos', icon: 'pi pi-fw pi-book', routerLink: ['/home/bitacora/bibliografia'] }
      ]
    }
  ];

  getMenuByRole(roleId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`/api/menu/${roleId}`).pipe(
      map((response) => {
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        let customError: ApiError = {
          status: error.status,
          error: error.error?.error || 'Error desconocido',
          message: error.error?.message || error.message,
          timestamp: new Date().toISOString()
        };
        
        // Repropagamos el error ya "normalizado"
        return throwError(() => customError);
      })
    );
  }
}
