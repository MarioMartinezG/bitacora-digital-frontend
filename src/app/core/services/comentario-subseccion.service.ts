import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { ComentarioSubseccionDTO, CrearComentarioSubseccionRequest } from '../models/comentario-subseccion.model';

@Injectable({
    providedIn: 'root'
})
export class ComentarioSubseccionService extends BaseHttpService {

    constructor(http: HttpClient) {
        super(http);
    }

    crearComentario(request: CrearComentarioSubseccionRequest): Observable<ComentarioSubseccionDTO> {
        return this.post<ComentarioSubseccionDTO>('/api/comentarios-subseccion', request);
    }

    obtenerComentarios(estudianteId: number, seccionCodigo: string, subseccionCodigo: string): Observable<ComentarioSubseccionDTO[]> {
        return this.get<ComentarioSubseccionDTO[]>(
            `/api/comentarios-subseccion/estudiante/${estudianteId}/seccion/${seccionCodigo}/subseccion/${subseccionCodigo}`
        );
    }

    obtenerComentariosPorSeccion(estudianteId: number, seccionCodigo: string): Observable<ComentarioSubseccionDTO[]> {
        return this.get<ComentarioSubseccionDTO[]>(
            `/api/comentarios-subseccion/estudiante/${estudianteId}/seccion/${seccionCodigo}`
        );
    }

    obtenerConteoPorSeccion(estudianteId: number, seccionCodigo: string): Observable<Record<string, number>> {
        return this.get<Record<string, number>>(
            `/api/comentarios-subseccion/estudiante/${estudianteId}/seccion/${seccionCodigo}/conteo`
        );
    }

    toggleResuelto(comentarioId: number): Observable<ComentarioSubseccionDTO> {
        return this.patch<ComentarioSubseccionDTO>(`/api/comentarios-subseccion/${comentarioId}/resolver`, {});
    }
}
