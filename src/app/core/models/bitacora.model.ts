export interface Respuesta {
    id: number;
    usuario_id: number;
    seccion_id: number;
    campo_id?: number;
    respuesta_texto?: string;
    respuesta_json?: any;
    estado_avance: 'sin_avances' | 'en_desarrollo' | 'completado';
    fecha_creacion: string;
    fecha_actualizacion: string;
}

export interface RespuestaRequest {
    usuario_id: number;
    seccion_id: number;
    campo_id?: number;
    respuesta_texto?: string | null;
    respuesta_json?: any;
    estado_avance: 'sin_avances' | 'en_desarrollo' | 'completado';
}

export interface EstadoSeccion {
    usuario_id: number;
    seccion_id: number;
    estado: 'sin_avances' | 'en_desarrollo' | 'completado';
    fecha_actualizacion?: string;
}