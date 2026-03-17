export interface ProgramaDTO {
  id: number;
  nombre: string;
  activo: boolean;
}

export interface CrearProgramaRequest {
  nombre: string;
}
