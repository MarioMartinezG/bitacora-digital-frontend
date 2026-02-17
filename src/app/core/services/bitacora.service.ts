import { inject, Injectable } from '@angular/core';

// Servicios
import { BaseHttpService } from './base-http.service';
import { LoginService } from './login.service';
import { EstadoSeccion, Respuesta, RespuestaRequest, GuardarSeccionRequest, RespuestaSeccionDTO } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService extends BaseHttpService {
  private loginService = inject(LoginService);

  // ============================================
  // Nuevos endpoints para secciones de bitácora
  // ============================================

  /**
   * Guardar/actualizar respuesta de una sección
   * PUT /api/bitacora/secciones/{seccionCodigo}
   */
  guardarSeccion(request: GuardarSeccionRequest): Observable<RespuestaSeccionDTO> {
    return this.put<RespuestaSeccionDTO>(
      `/api/bitacora/secciones/${request.seccionCodigo}`,
      request
    );
  }

  /**
   * Obtener respuesta de una sección para el usuario actual
   * GET /api/bitacora/secciones/{seccionCodigo}/usuario/{usuarioId}
   */
  obtenerSeccion(seccionCodigo: string): Observable<RespuestaSeccionDTO> {
    const usuarioId = this.obtenerUsuarioId();
    return this.get<RespuestaSeccionDTO>(
      `/api/bitacora/secciones/${seccionCodigo}/usuario/${usuarioId}`
    );
  }

  /**
   * Obtener respuesta de una sección para un estudiante específico (modo revisión tutor)
   * GET /api/bitacora/secciones/{seccionCodigo}/usuario/{estudianteId}
   */
  obtenerSeccionPorEstudiante(seccionCodigo: string, estudianteId: number): Observable<RespuestaSeccionDTO> {
    return this.get<RespuestaSeccionDTO>(
      `/api/bitacora/secciones/${seccionCodigo}/usuario/${estudianteId}`
    );
  }

  /**
   * Obtener todas las secciones del usuario
   * GET /api/bitacora/secciones/usuario/{usuarioId}
   */
  obtenerTodasSecciones(): Observable<Record<string, RespuestaSeccionDTO>> {
    const usuarioId = this.obtenerUsuarioId();
    return this.get<Record<string, RespuestaSeccionDTO>>(
      `/api/bitacora/secciones/usuario/${usuarioId}`
    );
  }

  // ============================================
  // Endpoints legacy (mantener por compatibilidad)
  // ============================================

  // Guardar respuestas en lote
  guardarRespuestasEnLote(respuestas: RespuestaRequest[]): Observable<Respuesta[]> {
    return this.post<Respuesta[]>(`/api/respuestas/lote`, respuestas);
  }

  // Guardar una sola respuesta (legacy)
  guardarRespuesta(respuesta: RespuestaRequest): Observable<Respuesta> {
    return this.post<Respuesta>(`/api/respuestas`, respuesta);
  }

  // Obtener respuestas de un usuario para un módulo específico
  obtenerRespuestasPorModulo(moduloId: number): Observable<Respuesta[]> {
    const usuarioId = this.obtenerUsuarioId();
    return this.get<Respuesta[]>(`/api/respuestas/usuario/${usuarioId}/modulo/${moduloId}`);
  }

  // Obtener respuestas de un usuario para una sección específica (legacy)
  obtenerRespuestasPorSeccion(seccionId: number): Observable<Respuesta[]> {
    const usuarioId = this.obtenerUsuarioId();
    return this.get<Respuesta[]>(`/api/respuestas/usuario/${usuarioId}/seccion/${seccionId}`);
  }

  // Actualizar estado de una sección (semáforo)
  actualizarEstadoSeccion(estadoSeccion: EstadoSeccion): Observable<EstadoSeccion> {
    return this.post<EstadoSeccion>(`/api/estado-secciones`, estadoSeccion);
  }

  // Obtener estados de sección para un módulo
  obtenerEstadosSeccion(moduloId: number): Observable<EstadoSeccion[]> {
    const usuarioId = this.obtenerUsuarioId();
    return this.get<EstadoSeccion[]>(`/api/estado-secciones/usuario/${usuarioId}/modulo/${moduloId}`);
  }

  // Obtener progreso general del usuario
  obtenerProgresoUsuario(): Observable<any> {
    const usuarioId = this.obtenerUsuarioId();
    return this.get<any>(`/api/progreso-curso/usuario/${usuarioId}`);
  }

  // Métodos auxiliares
  obtenerUsuarioId(): number {
    const usuario = JSON.parse(this.loginService.getUser() ?? '{}');
    return usuario.id;
  }

}
