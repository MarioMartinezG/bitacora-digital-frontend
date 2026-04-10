import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, Subscription, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { LoginService } from './login.service';
import { ToastService } from './toast.service';
import { WebSocketService, ConnectionState } from './websocket.service';
import { Notificacion, ResumenNotificaciones, PRIORIDAD_SEVERITY } from '../models';

@Injectable({
    providedIn: 'root'
})
export class NotificationService extends BaseHttpService {
    private loginService = inject(LoginService);
    private toastService = inject(ToastService);
    private wsService = inject(WebSocketService);

    // Suscripción WebSocket
    private wsSubscription?: Subscription;
    private wsStateSubscription?: Subscription;

    // Estado interno con signals (privados)
    private _notificaciones = signal<Notificacion[]>([]);
    private _resumen = signal<ResumenNotificaciones | null>(null);
    private _cargando = signal(false);
    private _wsConectado = signal<ConnectionState>('DISCONNECTED');

    // Signals expuestos (readonly)
    readonly notificaciones = this._notificaciones.asReadonly();
    readonly resumen = this._resumen.asReadonly();
    readonly cargando = this._cargando.asReadonly();
    readonly wsConectado = this._wsConectado.asReadonly();

    // Computed signals
    readonly noLeidas = computed(() => this._notificaciones().filter((n) => !n.leida));

    // Usa el resumen del backend si está disponible, sino cuenta desde el array local
    readonly conteoNoLeidas = computed(() => {
        const resumen = this._resumen();
        if (resumen) {
            return resumen.totalNoLeidas;
        }
        // Fallback: contar desde el array de notificaciones
        return this._notificaciones().filter((n) => !n.leida).length;
    });

    readonly tieneCriticas = computed(() => {
        const resumen = this._resumen();
        if (resumen) {
            return resumen.totalCriticas > 0;
        }
        // Fallback: verificar en el array de notificaciones
        return this._notificaciones().some((n) => !n.leida && n.prioridad === 'CRITICO');
    });

    readonly estaConectadoWs = computed(() => this._wsConectado() === 'CONNECTED');

    constructor(http: HttpClient) {
        super(http);
    }

    private get usuarioId(): number {
        const user = JSON.parse(this.loginService.getUser() ?? '{}');
        return user.id;
    }

    // GET /api/notificaciones/usuario/{usuarioId}
    cargarNotificaciones(): Observable<Notificacion[]> {
        this._cargando.set(true);

        return this.get<Notificacion[]>(`/api/notificaciones/usuario/${this.usuarioId}`).pipe(
            tap({
                next: (notificaciones) => {
                    this._notificaciones.set(notificaciones);
                    this._cargando.set(false);
                },
                error: () => this._cargando.set(false)
            })
        );
    }

    // GET /api/notificaciones/usuario/{usuarioId}/no-leidas
    cargarNoLeidas(): Observable<Notificacion[]> {
        return this.get<Notificacion[]>(`/api/notificaciones/usuario/${this.usuarioId}/no-leidas`).pipe(
            tap((notificaciones) => {
                const actuales = this._notificaciones();
                const idsNoLeidas = new Set(notificaciones.map((n) => n.id));
                const otras = actuales.filter((n) => n.leida && !idsNoLeidas.has(n.id));
                this._notificaciones.set([...notificaciones, ...otras]);
            })
        );
    }

    // GET /api/notificaciones/usuario/{usuarioId}/resumen
    cargarResumen(): Observable<ResumenNotificaciones> {
        return this.get<ResumenNotificaciones>(`/api/notificaciones/usuario/${this.usuarioId}/resumen`).pipe(tap((resumen) => this._resumen.set(resumen)));
    }

    // GET /api/notificaciones/usuario/{usuarioId}/tipo/{tipo}
    cargarPorTipo(tipo: string): Observable<Notificacion[]> {
        return this.get<Notificacion[]>(`/api/notificaciones/usuario/${this.usuarioId}/tipo/${tipo}`);
    }

    // GET /api/notificaciones/{id}
    obtenerPorId(notificacionId: number): Observable<Notificacion> {
        return this.get<Notificacion>(`/api/notificaciones/${notificacionId}`);
    }

    // PUT /api/notificaciones/{id}/leer
    marcarComoLeida(notificacionId: number): Observable<Notificacion> {
        return this.put<Notificacion>(`/api/notificaciones/${notificacionId}/leer`, {}).pipe(
            tap(() => {
                this._notificaciones.update((lista) => lista.map((n) => (n.id === notificacionId ? { ...n, leida: true } : n)));
                this._resumen.update((r) =>
                    r
                        ? {
                              ...r,
                              totalNoLeidas: Math.max(0, r.totalNoLeidas - 1)
                          }
                        : null
                );
            })
        );
    }

    // PUT /api/notificaciones/usuario/{usuarioId}/leer-todas
    marcarTodasComoLeidas(): Observable<void> {
        return this.put<void>(`/api/notificaciones/usuario/${this.usuarioId}/leer-todas`, {}).pipe(
            tap(() => {
                this._notificaciones.update((lista) => lista.map((n) => ({ ...n, leida: true })));
                this._resumen.update((r) => (r ? { ...r, totalNoLeidas: 0 } : null));
            })
        );
    }

    // DELETE /api/notificaciones/{id}
    eliminarNotificacion(notificacionId: number): Observable<void> {
        return this.delete<void>(`/api/notificaciones/${notificacionId}`).pipe(
            tap(() => {
                const eliminada = this._notificaciones().find((n) => n.id === notificacionId);
                this._notificaciones.update((lista) => lista.filter((n) => n.id !== notificacionId));

                if (eliminada && !eliminada.leida) {
                    this._resumen.update((r) =>
                        r
                            ? {
                                  ...r,
                                  totalNoLeidas: Math.max(0, r.totalNoLeidas - 1)
                              }
                            : null
                    );
                }
            })
        );
    }

    // Agregar notificación (para uso con WebSocket)
    agregarNotificacion(notificacion: Notificacion): void {
        this._notificaciones.update((lista) => [notificacion, ...lista]);

        // Actualizar resumen
        this._resumen.update((r) =>
            r
                ? {
                      ...r,
                      totalNoLeidas: r.totalNoLeidas + 1
                  }
                : null
        );

        // Mostrar toast según severity
        const severity = PRIORIDAD_SEVERITY[notificacion.prioridad];
        switch (severity) {
            case 'success':
                this.toastService.showSuccess(notificacion.titulo, notificacion.mensaje);
                break;
            case 'info':
                this.toastService.showInfo(notificacion.titulo, notificacion.mensaje);
                break;
            case 'warn':
                this.toastService.showWarn(notificacion.titulo, notificacion.mensaje);
                break;
            case 'error':
                this.toastService.showError(notificacion.titulo, notificacion.mensaje);
                break;
        }
    }

    // Limpiar estado (para logout)
    limpiarEstado(): void {
        this._notificaciones.set([]);
        this._resumen.set(null);
        this._cargando.set(false);
    }

    // ==================== WebSocket ====================

    iniciarWebSocket(): void {
        // Suscribirse al estado de conexión
        this.wsStateSubscription = this.wsService.state$.subscribe((state) => {
            this._wsConectado.set(state);
        });

        // Conectar al WebSocket
        this.wsService.connect();

        // Suscribirse a las notificaciones
        this.wsSubscription = this.wsService.subscribe<Notificacion>('/user/queue/notificaciones').subscribe({
            next: (notificacion) => {
                console.log('Nueva notificacion recibida via WebSocket:', notificacion);
                this.agregarNotificacion(notificacion);
            },
            error: (error) => {
                console.error('Error en suscripcion WebSocket:', error);
            }
        });
    }

    detenerWebSocket(): void {
        this.wsSubscription?.unsubscribe();
        this.wsSubscription = undefined;

        this.wsStateSubscription?.unsubscribe();
        this.wsStateSubscription = undefined;

        this.wsService.disconnect();
        this._wsConectado.set('DISCONNECTED');
    }
}
