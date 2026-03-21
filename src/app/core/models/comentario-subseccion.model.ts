export interface ComentarioSubseccionDTO {
    id: number;
    tutorId: number;
    nombreTutor: string;
    estudianteId: number;
    seccionCodigo: string;
    subseccionCodigo: string;
    comentario: string;
    fechaCreacion: string;
    resuelto: boolean;
    fechaResolucion: string | null;
}

export interface CrearComentarioSubseccionRequest {
    estudianteId: number;
    seccionCodigo: string;
    subseccionCodigo: string;
    comentario: string;
}
