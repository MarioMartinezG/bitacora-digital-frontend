export interface TutorEstudianteDTO {
  id: number;
  tutorId: number;
  nombreTutor: string;
  correoTutor: string;
  estudianteId: number;
  nombreEstudiante: string;
  correoEstudiante: string;
  fechaAsignacion: string;
  activo: boolean;
}

export interface AsignarTutorRequest {
  tutorId: number;
  estudianteId: number;
}

export interface TutorConEstudiantes {
  tutorId: number;
  nombreTutor: string;
  correoTutor: string;
  estudiantes: TutorEstudianteDTO[];
}
