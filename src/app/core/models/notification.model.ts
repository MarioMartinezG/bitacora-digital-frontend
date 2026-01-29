// Tipos de notificación según documentación del backend
export type TipoNotificacion =
    | 'SOLICITUD_SESION'
    | 'RESPUESTA_SOLICITUD'
    | 'VENCIMIENTO_PROXIMO'
    | 'UMBRAL_ALCANZADO';

export type PrioridadNotificacion = 'CRITICO' | 'ALERTA' | 'INFO' | 'SUCCESS';
export type SeverityPrimeNG = 'error' | 'warn' | 'info' | 'success';

// Interface principal de notificación
export interface Notificacion {
    id: number;
    usuarioId: number;
    tipo: TipoNotificacion;
    prioridad: PrioridadNotificacion;
    severity: SeverityPrimeNG;
    titulo: string;
    mensaje: string;
    leida: boolean;
    fechaCreacion: string;
    fechaLectura?: string;
    datosAdicionales?: Record<string, unknown>;
}

// Resumen de conteo de notificaciones (estructura del backend)
export interface ResumenNotificaciones {
    usuarioId: number;
    totalNoLeidas: number;
    totalCriticas: number;
    totalAlertas: number;
    totalInfo: number;
    totalSuccess?: number;
}

// Mapeo de prioridad a severity de PrimeNG
export const PRIORIDAD_SEVERITY: Record<PrioridadNotificacion, SeverityPrimeNG> = {
    CRITICO: 'error',
    ALERTA: 'warn',
    INFO: 'info',
    SUCCESS: 'success'
};

// Mapeo de tipo de notificación a icono PrimeIcons
export const TIPO_ICONO: Record<TipoNotificacion, string> = {
    SOLICITUD_SESION: 'pi-calendar-plus',
    RESPUESTA_SOLICITUD: 'pi-check-circle',
    VENCIMIENTO_PROXIMO: 'pi-clock',
    UMBRAL_ALCANZADO: 'pi-chart-line'
};

// Mapeo de prioridad a clases de color para iconos
export const PRIORIDAD_COLOR_CLASS: Record<PrioridadNotificacion, string> = {
    CRITICO: 'bg-red-100 dark:bg-red-400/10 text-red-500',
    ALERTA: 'bg-orange-100 dark:bg-orange-400/10 text-orange-500',
    INFO: 'bg-blue-100 dark:bg-blue-400/10 text-blue-500',
    SUCCESS: 'bg-green-100 dark:bg-green-400/10 text-green-500'
};
