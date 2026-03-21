export interface EstadisticasGenerales {
  totalEstudiantes: number;
  totalTutores: number;
  estudiantesActivos: number;
  promedioProgreso: number;
  alertasPendientes: number;
  progresosPorSeccion: MetricaProgreso[];
}

export interface MetricaProgreso {
  seccionCodigo: string;
  seccionNombre: string;
  totalEstudiantes: number;
  completados: number;
  enDesarrollo: number;
  sinAvances: number;
  porcentajeCompletado: number;
  promedioProgreso: number;
}

export interface AlertaSistema {
  id: number;
  tipo: string;
  prioridad: 'info' | 'warning' | 'error' | 'critical';
  titulo: string;
  mensaje: string;
  usuarioReferenciaId?: number;
  usuarioReferenciaNombre?: string;
  fechaCreacion: string;
  resuelta: boolean;
  datosAdicionales?: Record<string, any>;
}

export interface EstudianteBitacora {
  id: number;
  nombre: string;
  correo: string;
  progresoGlobal: number;
  asignatura: string;
  tutor: string;
  ultimaActividad: string;
}

export interface EstudianteBitacoraListResponse {
  estudiantes: EstudianteBitacora[];
  total: number;
}

export interface ReporteSeccion {
  seccionCodigo: string;
  estado: string;
  porcentaje: number;
}

export interface ReporteProgreso {
  estudianteId: number;
  estudianteNombre: string;
  estudianteCorreo: string;
  tutorNombre: string;
  porcentajeGeneral: number;
  secciones: ReporteSeccion[];
}
