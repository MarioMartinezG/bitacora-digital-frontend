/**
 * Estado del guardado automático
 */
export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface SaveState {
  status: SaveStatus;
  lastSaved: Date | null;
  isDirty: boolean;
  errorMessage?: string;
}

/**
 * Configuración para el auto-guardado
 */
export interface AutoSaveConfig {
  seccionCodigo: string;  // Código de la sección (ej: 'factores', 'ajustes')
  debounceTime?: number;  // default: 2000ms
  maxRetries?: number;    // default: 3
  getProgress?: () => { estado: 'sin_avances' | 'en_desarrollo' | 'completado'; totalPercentage: number };
}

/**
 * Estado inicial por defecto
 */
export const INITIAL_SAVE_STATE: SaveState = {
  status: 'idle',
  lastSaved: null,
  isDirty: false
};
