export interface ProgresoSeccionDTO {
    seccionCodigo: string;
    estado: string;
    porcentaje: number;
    estadoProfesor?: string;
    revisado?: boolean;
}

export interface EstudianteProgresoResumenDTO {
    estudianteId: number;
    nombreEstudiante: string;
    correoEstudiante: string;
    porcentajeTotal: number;
    estadoGeneral: string;
    secciones: Record<string, ProgresoSeccionDTO>;
}
