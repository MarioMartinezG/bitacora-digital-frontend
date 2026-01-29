import { Injectable, inject, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, BehaviorSubject, Observable, filter, take } from 'rxjs';
import { LoginService } from './login.service';
import { AppConfigService } from './app-config.service';

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
    private loginService = inject(LoginService);
    private appConfig = inject(AppConfigService);

    private client: Client | null = null;
    private subscriptions = new Map<string, StompSubscription>();

    private connectionState$ = new BehaviorSubject<ConnectionState>('DISCONNECTED');
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;
    private readonly reconnectDelay = 5000;

    readonly state$ = this.connectionState$.asObservable();

    connect(): void {
        if (this.client?.connected) {
            console.log('WebSocket ya conectado');
            return;
        }

        const token = this.loginService.getToken();
        if (!token) {
            console.warn('WebSocket: No hay token disponible para conectar');
            return;
        }

        this.connectionState$.next('CONNECTING');

        const wsUrl = `${this.appConfig.wsUrl}/ws/notificaciones`;

        this.client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: this.reconnectDelay,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,

            onConnect: () => {
                console.log('WebSocket conectado exitosamente');
                this.connectionState$.next('CONNECTED');
                this.reconnectAttempts = 0;
            },

            onDisconnect: () => {
                console.log('WebSocket desconectado');
                this.connectionState$.next('DISCONNECTED');
            },

            onStompError: (frame) => {
                console.error('Error STOMP:', frame.headers['message']);
                this.connectionState$.next('ERROR');
                this.handleReconnect();
            },

            onWebSocketError: (error) => {
                console.error('Error WebSocket:', error);
                this.connectionState$.next('ERROR');
            },

            onWebSocketClose: () => {
                console.log('WebSocket cerrado');
                this.connectionState$.next('DISCONNECTED');
            }
        });

        this.client.activate();
    }

    disconnect(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();

        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }

        this.connectionState$.next('DISCONNECTED');
        this.reconnectAttempts = 0;
    }

    subscribe<T>(destination: string): Observable<T> {
        const subject = new Subject<T>();

        // Esperar a que este conectado antes de suscribirse
        this.state$
            .pipe(
                filter((state) => state === 'CONNECTED'),
                take(1)
            )
            .subscribe(() => {
                if (!this.client) {
                    console.error('Cliente WebSocket no disponible');
                    return;
                }

                // Si ya existe una suscripción a este destino, la removemos
                if (this.subscriptions.has(destination)) {
                    this.subscriptions.get(destination)?.unsubscribe();
                    this.subscriptions.delete(destination);
                }

                const subscription = this.client.subscribe(destination, (message: IMessage) => {
                    try {
                        const body = JSON.parse(message.body) as T;
                        subject.next(body);
                    } catch (e) {
                        console.error('Error parseando mensaje WebSocket:', e);
                    }
                });

                this.subscriptions.set(destination, subscription);
                console.log(`Suscrito a: ${destination}`);
            });

        return subject.asObservable();
    }

    unsubscribe(destination: string): void {
        const subscription = this.subscriptions.get(destination);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(destination);
            console.log(`Desuscrito de: ${destination}`);
        }
    }

    isConnected(): boolean {
        return this.client?.connected ?? false;
    }

    private handleReconnect(): void {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Intentando reconexion ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${this.reconnectDelay / 1000}s...`);

            setTimeout(() => {
                if (this.connectionState$.getValue() !== 'CONNECTED') {
                    this.connect();
                }
            }, this.reconnectDelay);
        } else {
            console.error('Maximo de intentos de reconexion alcanzado');
        }
    }

    ngOnDestroy(): void {
        this.disconnect();
    }
}
