import { inject, Injectable } from '@angular/core';

// Servicios
import { BaseHttpService } from './base-http.service';
import { LoginService } from './login.service';
import { EstadoSeccion, Respuesta, RespuestaRequest } from '../models';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService extends BaseHttpService {
  loginService = inject(LoginService);
  headers: HttpHeaders = this.loginService.getAuthorizationHeader();

  // Guardar respuestas en lote
  guardarRespuestasEnLote(respuestas: RespuestaRequest[]): Observable<Respuesta[]> {
    const headers = this.loginService.getAuthorizationHeader();
    return this.post<Respuesta[]>(`/api/respuestas/lote`, respuestas, { headers });
  }

  // Guardar una sola respuesta
  guardarRespuesta(respuesta: RespuestaRequest): Observable<Respuesta> {
    const headers = this.loginService.getAuthorizationHeader();
    return this.post<Respuesta>(`/api/respuestas`, respuesta, { headers });
  }

  // Obtener respuestas de un usuario para un módulo específico
  obtenerRespuestasPorModulo(moduloId: number): Observable<Respuesta[]> {
    const headers = this.loginService.getAuthorizationHeader();
    const usuarioId = this.obtenerUsuarioId();
    return this.get<Respuesta[]>(`/api/respuestas/usuario/${usuarioId}/modulo/${moduloId}`, { headers });
  }

  // Obtener respuestas de un usuario para una sección específica
  obtenerRespuestasPorSeccion(seccionId: number): Observable<Respuesta[]> {
    const headers = this.loginService.getAuthorizationHeader();
    const usuarioId = this.obtenerUsuarioId();
    return this.get<Respuesta[]>(`/api/respuestas/usuario/${usuarioId}/seccion/${seccionId}`, { headers });
  }

  // Actualizar estado de una sección (semáforo)
  actualizarEstadoSeccion(estadoSeccion: EstadoSeccion): Observable<EstadoSeccion> {
    const headers = this.loginService.getAuthorizationHeader();
    return this.post<EstadoSeccion>(`/api/estado-secciones`, estadoSeccion, { headers });
  }

  // Obtener estados de sección para un módulo
  obtenerEstadosSeccion(moduloId: number): Observable<EstadoSeccion[]> {
    const headers = this.loginService.getAuthorizationHeader();
    const usuarioId = this.obtenerUsuarioId();
    return this.get<EstadoSeccion[]>(`/api/estado-secciones/usuario/${usuarioId}/modulo/${moduloId}`, { headers });
  }

  // Obtener progreso general del usuario
  obtenerProgresoUsuario(): Observable<any> {
    const headers = this.loginService.getAuthorizationHeader();
    const usuarioId = this.obtenerUsuarioId();
    return this.get<any>(`/api/progreso-curso/usuario/${usuarioId}`, { headers });
  }

  // Métodos auxiliares
  obtenerUsuarioId(): number {
    const usuario = JSON.parse(this.loginService.getUser() ?? '');
    return usuario.id;
  }

}
