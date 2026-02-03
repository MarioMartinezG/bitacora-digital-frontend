// Mensaje individual en el chat
export interface TutorMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    // Metadata adicional solo para mensajes del tutor
    metadata?: TutorResponseMetadata;
}

// Metadata de respuesta del tutor (para mostrar info adicional)
export interface TutorResponseMetadata {
    confidence: number;              // 0.0 - 1.0
    sources: string[];               // Documentos fuente consultados
    suggestedActions: string[];      // Acciones sugeridas
    modelUsed: string;               // Ej: "qwen2.5:7b-instruct"
    processingTimeMs: number;        // Tiempo de procesamiento
}

// Request para POST /api/tutor/ask
export interface TutorAskRequest {
    question: string;
    module: string;                  // Ej: "Ajustes Razonables"
    user_id: string;                 // Ej: "mmartinezg"
    session_id: string;              // UUID de la sesión
    user_role: string;               // Ej: "estudiante", "docente"
    course_id: string;               // Ej: "ajustes_razonables"
}

// Response de POST /api/tutor/ask
export interface TutorAskResponse {
    timestamp: string;
    module: string;
    answer: string;
    confidence: number;
    sources: string[];
    request_id: string;
    user_id: string;
    session_id: string;
    suggested_actions: string[];
    model_used: string;
    processing_time_ms: number;
}

// Response de error del backend
export interface TutorErrorResponse {
    error: string;                   // Ej: "ErrorAutenticacion"
    message: string;                 // Ej: "Token JWT expirado"
    status: number;                  // Ej: 401
    timestamp: string;
}

export interface TutorStatusResponse {
    status: string;
    version?: string;
}

export interface TutorHealthResponse {
    healthy: boolean;
    details?: Record<string, unknown>;
}

export type TutorWidgetState = 'idle' | 'loading' | 'error';

export interface TutorContext {
    module: string;
    courseId: string;
}

// Request para POST /api/solicitudes-sesion
export interface SolicitudSesionRequest {
    estudianteId: number;
    motivo: string;
}

// Response de POST /api/solicitudes-sesion
export interface SolicitudSesionResponse {
    id: number;
    estudianteId: number;
    nombreEstudiante: string;
    correoEstudiante: string;
    tutorId: number;
    nombreTutor: string;
    correoTutor: string;
    motivo: string;
    estado: string;
    fechaSolicitud: string;
    fechaRespuesta: string | null;
    notasTutor: string | null;
}
