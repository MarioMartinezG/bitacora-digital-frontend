import { Injectable, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, tap, filter } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { LoginService } from './login.service';
import {
    TutorMessage,
    TutorAskRequest,
    TutorAskResponse,
    TutorStatusResponse,
    TutorHealthResponse,
    TutorWidgetState,
    TutorContext,
    SolicitudSesionRequest,
    SolicitudSesionResponse,
    TutorModule,
    TutorHealth,
    TutorStatus,
    DocumentListResponse,
    DocumentUploadResponse,
    IndexTaskResponse,
    IndexStatusResponse
} from '../models/tutor.model';

@Injectable({
    providedIn: 'root'
})
export class TutorService extends BaseHttpService {
    private loginService = inject(LoginService);
    private router = inject(Router);

    // Módulo por defecto para rutas que no son de bitácora
    private readonly DEFAULT_MODULE = 'generico';

    // Estado interno con signals (privados)
    private _messages = signal<TutorMessage[]>([]);
    private _sessionId = signal<string>(this.generateSessionId());
    private _state = signal<TutorWidgetState>('idle');
    private _isOnline = signal<boolean>(false);
    private _context = signal<TutorContext>({
        module: this.DEFAULT_MODULE,
        courseId: 'bitacora_digital'
    });

    // Signals expuestos (readonly)
    readonly messages = this._messages.asReadonly();
    readonly sessionId = this._sessionId.asReadonly();
    readonly state = this._state.asReadonly();
    readonly isOnline = this._isOnline.asReadonly();
    readonly context = this._context.asReadonly();

    // Computed signals
    readonly isLoading = computed(() => this._state() === 'loading');
    readonly hasError = computed(() => this._state() === 'error');
    readonly hasMessages = computed(() => this._messages().length > 0);

    constructor(http: HttpClient) {
        super(http);
        this.initRouteListener();
    }

    private initRouteListener(): void {
        // Escuchar cambios de ruta para actualizar el módulo automáticamente
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd)
        ).subscribe((event) => {
            const module = this.extractModuleFromUrl(event.urlAfterRedirects);
            this.setContext({ module });
        });

        // Configurar módulo inicial basado en la ruta actual
        const initialModule = this.extractModuleFromUrl(this.router.url);
        this.setContext({ module: initialModule });
    }

    private extractModuleFromUrl(url: string): string {
        // Si la URL contiene /bitacora/, extraer el último segmento
        const bitacoraMatch = url.match(/\/bitacora\/([^/?]+)/);
        if (bitacoraMatch) {
            return bitacoraMatch[1];
        }
        // Para cualquier otra ruta, usar módulo genérico
        return this.DEFAULT_MODULE;
    }

    private get userData(): { id: number; username: string; role: number; nombre: string } {
        const userStr = this.loginService.getUser();
        if (!userStr) {
            return { id: 0, username: 'anonymous', role: 0, nombre: 'Usuario' };
        }
        return JSON.parse(userStr);
    }

    private getUserRole(): string {
        const roleMap: Record<number, string> = {
            1: 'estudiante',
            2: 'docente',
            3: 'administrador'
        };
        return roleMap[this.userData.role] || 'estudiante';
    }

    private generateSessionId(): string {
        return crypto.randomUUID();
    }

    private generateMessageId(): string {
        return crypto.randomUUID();
    }

    // GET /api/tutor/status
    checkStatus(): Observable<TutorStatusResponse> {
        return this.get<TutorStatusResponse>('/api/tutor/status').pipe(
            tap({
                next: () => this._isOnline.set(true),
                error: () => this._isOnline.set(false)
            })
        );
    }

    // GET /api/tutor/health
    checkHealth(): Observable<TutorHealthResponse> {
        return this.get<TutorHealthResponse>('/api/tutor/health').pipe(
            tap({
                next: (response) => this._isOnline.set(response.healthy),
                error: () => this._isOnline.set(false)
            })
        );
    }

    // POST /api/tutor/ask
    ask(question: string): Observable<TutorAskResponse> {
        // Crear mensaje del usuario
        const userMessage: TutorMessage = {
            id: this.generateMessageId(),
            content: question,
            role: 'user',
            timestamp: new Date()
        };

        // Agregar mensaje del usuario al estado
        this._messages.update(messages => [...messages, userMessage]);
        this._state.set('loading');

        // Construir request
        const request: TutorAskRequest = {
            question,
            module: this._context().module,
            user_id: this.userData.username,
            session_id: this._sessionId(),
            user_role: this.getUserRole(),
            course_id: this._context().courseId
        };

        return this.post<TutorAskResponse>('/api/tutor/ask', request).pipe(
            tap({
                next: (response) => {
                    // Crear mensaje del tutor con metadata
                    const tutorMessage: TutorMessage = {
                        id: response.request_id,
                        content: response.answer,
                        role: 'assistant',
                        timestamp: new Date(response.timestamp),
                        metadata: {
                            confidence: response.confidence,
                            sources: response.sources,
                            suggestedActions: response.suggested_actions,
                            modelUsed: response.model_used,
                            processingTimeMs: response.processing_time_ms
                        }
                    };

                    // Agregar mensaje del tutor al estado
                    this._messages.update(messages => [...messages, tutorMessage]);
                    this._state.set('idle');
                    this._isOnline.set(true);
                },
                error: () => {
                    this._state.set('error');
                }
            })
        );
    }

    // ── Coordinador: gestión de documentos e indexación ─────────────────

    // GET /api/tutor/health (respuesta completa para el coordinador)
    getHealth(): Observable<TutorHealth> {
        return this.get<TutorHealth>('/api/tutor/health');
    }

    // GET /api/tutor/status (respuesta completa para el coordinador)
    getStatus(): Observable<TutorStatus> {
        return this.get<TutorStatus>('/api/tutor/status');
    }

    // GET /api/tutor/modules
    getModules(): Observable<TutorModule[]> {
        return this.get<TutorModule[]>('/api/tutor/modules');
    }

    // GET /api/tutor/documents
    getDocuments(): Observable<DocumentListResponse> {
        return this.get<DocumentListResponse>('/api/tutor/documents');
    }

    // POST /api/tutor/documents/upload
    uploadDocuments(files: File[]): Observable<DocumentUploadResponse> {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        return this.handleRequest<DocumentUploadResponse>(
            this.http.post<DocumentUploadResponse>('/api/tutor/documents/upload', formData)
        );
    }

    // POST /api/tutor/index
    startIndexing(): Observable<IndexTaskResponse> {
        return this.post<IndexTaskResponse>('/api/tutor/index', {});
    }

    // GET /api/tutor/index/status/{taskId}
    getIndexStatus(taskId: string): Observable<IndexStatusResponse> {
        return this.get<IndexStatusResponse>(`/api/tutor/index/status/${taskId}`);
    }

    // POST /api/tutor/ask (versión sin manejo de estado interno, para el coordinador)
    askRaw(request: TutorAskRequest): Observable<TutorAskResponse> {
        return this.post<TutorAskResponse>('/api/tutor/ask', request);
    }

    // POST /api/solicitudes-sesion - Solicitar sesión con tutor humano
    solicitarSesionTutor(motivo: string): Observable<SolicitudSesionResponse> {
        const request: SolicitudSesionRequest = {
            estudianteId: this.userData.id,
            motivo
        };

        return this.post<SolicitudSesionResponse>('/api/solicitudes-sesion', request);
    }

    // GET /api/solicitudes-sesion/estudiante/{estudianteId}
    obtenerSolicitudesSesion(): Observable<SolicitudSesionResponse[]> {
        return this.get<SolicitudSesionResponse[]>(
            `/api/solicitudes-sesion/estudiante/${this.userData.id}`
        );
    }

    // DELETE /api/solicitudes-sesion/{idSesion}/estudiante/{estudianteId}
    eliminarSolicitudSesion(idSesion: number): Observable<void> {
        return this.delete<void>(
            `/api/solicitudes-sesion/${idSesion}/estudiante/${this.userData.id}`
        );
    }

    // Actualizar contexto (módulo/curso)
    setContext(context: Partial<TutorContext>): void {
        this._context.update(current => ({
            ...current,
            ...context
        }));
    }

    // Reiniciar conversación (nueva sesión)
    startNewSession(): void {
        this._messages.set([]);
        this._sessionId.set(this.generateSessionId());
        this._state.set('idle');
    }

    // Limpiar todo el estado (logout)
    clearState(): void {
        this._messages.set([]);
        this._sessionId.set(this.generateSessionId());
        this._state.set('idle');
        this._isOnline.set(false);
        this._context.set({
            module: this.DEFAULT_MODULE,
            courseId: 'bitacora_digital'
        });
    }
}
