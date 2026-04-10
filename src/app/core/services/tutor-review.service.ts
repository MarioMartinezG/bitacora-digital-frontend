import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseHttpService } from './base-http.service';
import { LoginService } from './login.service';
import { EstudianteProgresoResumenDTO, ProgresoSeccionDTO } from '../models/estudiante-progreso.model';
import { RespuestaSeccionDTO } from '../models';

@Injectable({
    providedIn: 'root'
})
export class TutorReviewService extends BaseHttpService {
    private loginService = inject(LoginService);

    constructor(http: HttpClient) {
        super(http);
    }

    obtenerProgresoEstudiantes(tutorId: number): Observable<EstudianteProgresoResumenDTO[]> {
        return this.get<EstudianteProgresoResumenDTO[]>(
            `/api/bitacora/progreso/tutor/${tutorId}/estudiantes`
        );
    }

    obtenerProgresoIndividual(estudianteId: number): Observable<EstudianteProgresoResumenDTO> {
        return this.get<EstudianteProgresoResumenDTO>(
            `/api/bitacora/progreso/usuario/${estudianteId}`
        );
    }

    obtenerRespuestasEstudiante(estudianteId: number, seccionCodigo: string): Observable<RespuestaSeccionDTO> {
        return this.get<RespuestaSeccionDTO>(
            `/api/bitacora/secciones/${seccionCodigo}/usuario/${estudianteId}`
        );
    }

    obtenerTodasRespuestasEstudiante(estudianteId: number): Observable<Record<string, RespuestaSeccionDTO>> {
        return this.get<Record<string, RespuestaSeccionDTO>>(
            `/api/bitacora/secciones/usuario/${estudianteId}`
        );
    }

    marcarRevisado(estudianteId: number, seccionCodigo: string, revisado: boolean): Observable<ProgresoSeccionDTO> {
        return this.patch<ProgresoSeccionDTO>('/api/bitacora/progreso/revisado', {
            estudianteId,
            seccionCodigo,
            revisado
        });
    }

    actualizarEstadoProfesor(estudianteId: number, seccionCodigo: string, estadoProfesor: string): Observable<ProgresoSeccionDTO> {
        return this.patch<ProgresoSeccionDTO>('/api/bitacora/progreso/estado-profesor', {
            estudianteId,
            seccionCodigo,
            estadoProfesor
        });
    }

    limpiarEstadoProfesor(estudianteId: number, seccionCodigo: string): Observable<ProgresoSeccionDTO> {
        return this.delete<ProgresoSeccionDTO>(
            `/api/bitacora/progreso/estado-profesor/usuario/${estudianteId}/seccion/${seccionCodigo}`
        );
    }

    aprobarBitacora(estudianteId: number): Observable<void> {
        return this.post<void>(`/api/bitacora/progreso/aprobar/${estudianteId}`, {});
    }

    obtenerTutorId(): number {
        const usuario = JSON.parse(this.loginService.getUser() ?? '{}');
        return usuario.id;
    }
}
