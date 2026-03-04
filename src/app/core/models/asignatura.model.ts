export interface Asignatura {
  id: number;
  nombre: string;
  codigo: string;
  descripcion: string;
  creditos?: number;
  semestre?: number;
  activa: boolean;
  totalEstudiantes: number;
  totalTutores: number;
  fechaCreacion: string;
}

export interface CreateAsignaturaRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
  creditos?: number;
  semestre?: number;
}

export interface UpdateAsignaturaRequest {
  codigo?: string;
  nombre?: string;
  descripcion?: string;
  creditos?: number;
  semestre?: number;
  activa?: boolean;
}

export interface AsignarEstudiantesRequest {
  estudianteIds: number[];
}

export interface AsignarTutoresRequest {
  tutorIds: number[];
}
