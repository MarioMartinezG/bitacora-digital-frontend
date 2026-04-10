import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';

export interface ConfiguracionNotificacionDTO {
    id: number;
    clave: string;
    valor: string;
    descripcion: string;
    tipoDato: string;
}

@Injectable({
    providedIn: 'root'
})
export class ConfiguracionService extends BaseHttpService {

    constructor(http: HttpClient) {
        super(http);
    }

    obtenerConfiguraciones(): Observable<ConfiguracionNotificacionDTO[]> {
        return this.get<ConfiguracionNotificacionDTO[]>('/api/configuracion/notificaciones');
    }

    obtenerConfiguracion(clave: string): Observable<ConfiguracionNotificacionDTO> {
        return this.get<ConfiguracionNotificacionDTO>(`/api/configuracion/notificaciones/${clave}`);
    }

    actualizarConfiguracion(clave: string, valor: string): Observable<ConfiguracionNotificacionDTO> {
        const params = new HttpParams().set('valor', valor);
        return this.put<ConfiguracionNotificacionDTO>(
            `/api/configuracion/notificaciones/${clave}`,
            null,
            { params }
        );
    }
}
