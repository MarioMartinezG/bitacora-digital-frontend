import { inject, Injectable } from '@angular/core';

// Servicios
import { BaseHttpService } from './base-http.service';
import { LoginService } from './login.service';
import { EstadoSeccion, Respuesta, RespuestaRequest } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService extends BaseHttpService {
  private loginService = inject(LoginService);

  // Guardar respuestas en lote
  guardarRespuestasEnLote(respuestas: RespuestaRequest[]): Observable<Respuesta[]> {
    return this.post<Respuesta[]>(`/api/respuestas/lote`, respuestas);
  }

  // Guardar una sola respuesta
  guardarRespuesta(respuesta: RespuestaRequest): Observable<Respuesta> {
    return this.post<Respuesta>(`/api/respuestas`, respuesta);
  }

  // Obtener respuestas de un usuario para un módulo específico
  obtenerRespuestasPorModulo(moduloId: number): Observable<Respuesta[]> {
    const usuarioId = this.obtenerUsuarioId();
    return this.get<Respuesta[]>(`/api/respuestas/usuario/${usuarioId}/modulo/${moduloId}`);
  }

  // Obtener respuestas de un usuario para una sección específica
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
  private obtenerUsuarioId(): number {
    const usuario = JSON.parse(this.loginService.getUser() ?? '{}');
    return usuario.id;
  }

}
