export interface InstrumentoDTO {
  id: number;
  label: string;
  value: string;
  activo: boolean;
}

export interface CrearInstrumentoRequest {
  label: string;
}
