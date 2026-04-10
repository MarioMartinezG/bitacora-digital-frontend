export type CategoriaMedio = 'ESCRITOS' | 'ORALES' | 'PRACTICOS';

export interface MedioDTO {
  id: number;
  label: string;
  value: string;
  categoria: CategoriaMedio;
  activo: boolean;
}

export interface CrearMedioRequest {
  label: string;
  categoria: string;
}

export interface MedioGrupo {
  label: string;
  icon: string;
  items: { label: string; value: string }[];
}

export const CATEGORIA_MEDIO_CONFIG: Record<CategoriaMedio, { label: string; icon: string }> = {
  ESCRITOS:  { label: 'Escritos',   icon: 'pi pi-file text-green-500' },
  ORALES:    { label: 'Orales',     icon: 'pi pi-microphone text-orange-500' },
  PRACTICOS: { label: 'Prácticos',  icon: 'pi pi-cog text-purple-500' },
};
