export interface MetodologiaDTO {
  id: number;
  label: string;
  value: string;
  activo: boolean;
}

export interface CrearMetodologiaRequest {
  label: string;
}
