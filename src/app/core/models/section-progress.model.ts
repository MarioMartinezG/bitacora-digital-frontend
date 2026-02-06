/**
 * Estado de avance de una sección
 */
export type EstadoAvance = 'sin_avances' | 'en_desarrollo' | 'completado';

/**
 * Progreso de una sección del formulario
 */
export interface SectionProgress {
  /** Nombre identificador de la sección */
  sectionName: string;
  /** Número de campos completados */
  completedFields: number;
  /** Número total de campos */
  totalFields: number;
  /** Porcentaje de progreso (0-100) */
  percentage: number;
  /** Estado de avance calculado */
  estado: EstadoAvance;
  /** Estado de avance asignado por el profesor (si aplica) */
  estadoProfesor?: EstadoAvance;
}

/**
 * Progreso general de un componente de bitácora
 */
export interface ComponentProgress {
  /** Progreso por cada sección */
  sections: SectionProgress[];
  /** Progreso total del componente (0-100) */
  totalPercentage: number;
  /** Estado general del componente */
  estado: EstadoAvance;
}

/**
 * Calcula el estado de avance basado en el porcentaje
 */
export function calcularEstadoAvance(percentage: number): EstadoAvance {
  if (percentage === 0) return 'sin_avances';
  if (percentage === 100) return 'completado';
  return 'en_desarrollo';
}

/**
 * Mapeo de severidad de PrimeNG Tag según el estado
 */
export function getSeverityByEstado(estado: EstadoAvance): 'success' | 'warn' | 'danger' {
  switch (estado) {
    case 'completado': return 'success';
    case 'en_desarrollo': return 'warn';
    case 'sin_avances': return 'danger';
  }
}

/**
 * Texto a mostrar en el tag según el estado
 */
export function getLabelByEstado(estado: EstadoAvance): string {
  switch (estado) {
    case 'completado': return 'Completado';
    case 'en_desarrollo': return 'En desarrollo';
    case 'sin_avances': return 'Sin avances';
  }
}
