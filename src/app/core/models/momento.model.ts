export interface MomentoDTO {
  id: number;
  nombre: string;
  descripcion?: string;
  fechaLimite: string;
  activo: boolean;
  secciones: string[];
}

export interface CrearMomentoRequest {
  nombre: string;
  descripcion?: string;
  fechaLimite: string;
  secciones: string[];
}
