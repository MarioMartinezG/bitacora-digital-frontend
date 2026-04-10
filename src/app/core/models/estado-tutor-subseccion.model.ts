export interface EstadoTutorSubseccionDTO {
    id: number;
    seccionCodigo: string;
    subseccionCodigo: string;
    estado: 'sin_avances' | 'en_desarrollo' | 'completado';
    fechaActualizacion: string;
}

export interface ActualizarEstadoTutorSubseccionRequest {
    estudianteId: number;
    seccionCodigo: string;
    subseccionCodigo: string;
    estado: 'sin_avances' | 'en_desarrollo' | 'completado';
}
