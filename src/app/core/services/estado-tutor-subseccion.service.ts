import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { EstadoTutorSubseccionDTO, ActualizarEstadoTutorSubseccionRequest } from '../models/estado-tutor-subseccion.model';

@Injectable({
    providedIn: 'root'
})
export class EstadoTutorSubseccionService extends BaseHttpService {

    constructor(http: HttpClient) {
        super(http);
    }

    actualizarEstado(request: ActualizarEstadoTutorSubseccionRequest): Observable<EstadoTutorSubseccionDTO> {
        return this.handleRequest<EstadoTutorSubseccionDTO>(
            this.http.patch<EstadoTutorSubseccionDTO>('/api/estado-tutor-subseccion', request)
        );
    }

    obtenerEstadosPorSeccion(estudianteId: number, seccionCodigo: string): Observable<EstadoTutorSubseccionDTO[]> {
        return this.get<EstadoTutorSubseccionDTO[]>(
            `/api/estado-tutor-subseccion/estudiante/${estudianteId}/seccion/${seccionCodigo}`
        );
    }

    obtenerEstadosPorEstudiante(estudianteId: number): Observable<EstadoTutorSubseccionDTO[]> {
        return this.get<EstadoTutorSubseccionDTO[]>(
            `/api/estado-tutor-subseccion/estudiante/${estudianteId}`
        );
    }
}
