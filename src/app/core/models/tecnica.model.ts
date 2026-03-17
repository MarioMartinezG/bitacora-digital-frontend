export type GrupoTecnica = 'ALUMNO_NO_INTERVIENE' | 'ALUMNO_PARTICIPA';

export interface TecnicaDTO {
  id: number;
  label: string;
  value: string;
  grupo: GrupoTecnica;
  activo: boolean;
}

export interface CrearTecnicaRequest {
  label: string;
  grupo: string;
}

export interface TecnicaGrupo {
  label: string;
  icon: string;
  items: { label: string; value: string }[];
}

export const GRUPO_TECNICA_CONFIG: Record<GrupoTecnica, { label: string; icon: string }> = {
  ALUMNO_NO_INTERVIENE: { label: 'El alumno no interviene', icon: 'pi pi-eye text-cyan-500' },
  ALUMNO_PARTICIPA:     { label: 'El alumno participa',     icon: 'pi pi-users text-indigo-500' },
};
