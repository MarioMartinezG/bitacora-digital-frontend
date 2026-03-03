import { Usuario } from '../models/usuario.model';
import { Asignatura, AsignaturaListResponse } from '../models/asignatura.model';
import { EstadisticasGenerales, MetricaProgreso, AlertaSistema, ReporteProgreso, EstudianteBitacora } from '../models/estadisticas.model';
import { UserRole } from '../models/role.model';

export const MOCK_USUARIOS: Usuario[] = [
  {
    id: 1,
    nombre: 'Juan Pérez',
    correo: 'juan.perez@ejemplo.com',
    roles: [UserRole.ESTUDIANTE],
    rolesNombres: ['estudiante'],
    activo: true,
    fechaCreacion: '2024-01-15T10:00:00Z',
    ultimoAcceso: '2024-02-20T14:30:00Z'
  },
  {
    id: 2,
    nombre: 'María García',
    correo: 'maria.garcia@ejemplo.com',
    roles: [UserRole.TUTOR],
    rolesNombres: ['tutor'],
    activo: true,
    fechaCreacion: '2024-01-10T09:00:00Z',
    ultimoAcceso: '2024-02-21T16:00:00Z'
  },
  {
    id: 3,
    nombre: 'Carlos Rodríguez',
    correo: 'carlos.rodriguez@ejemplo.com',
    roles: [UserRole.COORDINADOR],
    rolesNombres: ['admin'],
    activo: true,
    fechaCreacion: '2023-09-01T08:00:00Z',
    ultimoAcceso: '2024-02-22T10:00:00Z'
  },
  {
    id: 4,
    nombre: 'Ana Martínez',
    correo: 'ana.martinez@ejemplo.com',
    roles: [UserRole.COORDINADOR, UserRole.TUTOR],
    rolesNombres: ['admin', 'tutor'],
    activo: true,
    fechaCreacion: '2023-09-01T08:00:00Z',
    ultimoAcceso: '2024-02-22T11:30:00Z'
  },
  {
    id: 5,
    nombre: 'Pedro Sánchez',
    correo: 'pedro.sanchez@ejemplo.com',
    roles: [UserRole.ESTUDIANTE],
    rolesNombres: ['estudiante'],
    activo: false,
    fechaCreacion: '2024-01-20T10:00:00Z',
    ultimoAcceso: '2024-02-01T12:00:00Z'
  },
  {
    id: 6,
    nombre: 'Laura Gómez',
    correo: 'laura.gomez@ejemplo.com',
    roles: [UserRole.ESTUDIANTE],
    rolesNombres: ['estudiante'],
    activo: true,
    fechaCreacion: '2024-02-01T10:00:00Z',
    ultimoAcceso: '2024-02-22T09:15:00Z'
  },
  {
    id: 7,
    nombre: 'Diego Torres',
    correo: 'diego.torres@ejemplo.com',
    roles: [UserRole.TUTOR],
    rolesNombres: ['tutor'],
    activo: true,
    fechaCreacion: '2024-01-05T08:00:00Z',
    ultimoAcceso: '2024-02-21T18:00:00Z'
  }
];

export const MOCK_ASIGNATURAS: Asignatura[] = [
  {
    id: 1,
    codigo: 'MAT401',
    nombre: 'Matemáticas Avanzadas',
    descripcion: 'Curso de cálculo diferencial e integral avanzado',
    activa: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    tutores: [{ id: 2, nombre: 'María García', correo: 'maria.garcia@ejemplo.com' }],
    estudiantesCount: 25
  },
  {
    id: 2,
    codigo: 'FIS501',
    nombre: 'Física Cuántica',
    descripcion: 'Introducción a la mecánica cuántica',
    activa: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    tutores: [{ id: 2, nombre: 'María García', correo: 'maria.garcia@ejemplo.com' }],
    estudiantesCount: 18
  },
  {
    id: 3,
    codigo: 'QUI301',
    nombre: 'Química Orgánica',
    descripcion: 'Fundamentos de química orgánica',
    activa: true,
    fechaCreacion: '2024-01-01T00:00:00Z',
    tutores: [{ id: 4, nombre: 'Ana Martínez', correo: 'ana.martinez@ejemplo.com' }],
    estudiantesCount: 30
  }
];

export const MOCK_METRICAS_PROGRESO: MetricaProgreso[] = [
  { seccionCodigo: 'caracteriza-asignatura', seccionNombre: 'Caracteriza tu Asignatura', totalEstudiantes: 55, completados: 45, enDesarrollo: 8, sinAvances: 2, porcentajeCompletado: 81.8 },
  { seccionCodigo: 'factores-situacionales', seccionNombre: 'Factores Situacionales', totalEstudiantes: 55, completados: 38, enDesarrollo: 12, sinAvances: 5, porcentajeCompletado: 69.1 },
  { seccionCodigo: 'ajustes-razonables', seccionNombre: 'Ambientes Sanos y Seguros', totalEstudiantes: 55, completados: 30, enDesarrollo: 15, sinAvances: 10, porcentajeCompletado: 54.5 },
  { seccionCodigo: 'rap-rac', seccionNombre: 'RAP y RAC', totalEstudiantes: 55, completados: 25, enDesarrollo: 18, sinAvances: 12, porcentajeCompletado: 45.5 },
  { seccionCodigo: 'actividades-aprendizaje', seccionNombre: 'Actividades de Aprendizaje', totalEstudiantes: 55, completados: 20, enDesarrollo: 20, sinAvances: 15, porcentajeCompletado: 36.4 },
  { seccionCodigo: 'como-evaluare', seccionNombre: 'Cómo Evaluaré', totalEstudiantes: 55, completados: 18, enDesarrollo: 15, sinAvances: 22, porcentajeCompletado: 32.7 },
  { seccionCodigo: 'secuencia-curso', seccionNombre: 'Secuencia del Curso', totalEstudiantes: 55, completados: 15, enDesarrollo: 12, sinAvances: 28, porcentajeCompletado: 27.3 },
  { seccionCodigo: 'bibliografia', seccionNombre: 'Bibliografía', totalEstudiantes: 55, completados: 12, enDesarrollo: 10, sinAvances: 33, porcentajeCompletado: 21.8 }
];

export const MOCK_ESTADISTICAS: EstadisticasGenerales = {
  totalEstudiantes: 55,
  totalTutores: 15,
  totalAsignaturas: 8,
  estudiantesActivos: 48,
  promedioProgreso: 62.5,
  alertasPendientes: 5,
  progresosPorSeccion: MOCK_METRICAS_PROGRESO
};

export const MOCK_ALERTAS: AlertaSistema[] = [
  {
    id: 1,
    tipo: 'estudiante_inactivo',
    prioridad: 'warning',
    titulo: 'Estudiante inactivo',
    mensaje: 'Pedro Sánchez no ha accedido a la plataforma en 15 días',
    usuarioReferenciaId: 5,
    usuarioReferenciaNombre: 'Pedro Sánchez',
    fechaCreacion: '2024-02-20T10:00:00Z',
    resuelta: false
  },
  {
    id: 2,
    tipo: 'progreso_bajo',
    prioridad: 'warning',
    titulo: 'Progreso bajo detectado',
    mensaje: 'Juan Pérez tiene solo 15% de completitud en Análisis del Entorno',
    usuarioReferenciaId: 1,
    usuarioReferenciaNombre: 'Juan Pérez',
    fechaCreacion: '2024-02-21T14:30:00Z',
    resuelta: false
  },
  {
    id: 3,
    tipo: 'sesion_pendiente',
    prioridad: 'info',
    titulo: 'Solicitudes de sesión pendientes',
    mensaje: '3 solicitudes de sesión de tutoría pendientes de asignación',
    fechaCreacion: '2024-02-22T09:00:00Z',
    resuelta: false
  },
  {
    id: 4,
    tipo: 'error_sistema',
    prioridad: 'critical',
    titulo: 'Error en servicio de notificaciones',
    mensaje: 'El servicio de correo electrónico no responde desde hace 2 horas',
    fechaCreacion: '2024-02-22T08:00:00Z',
    resuelta: true
  },
  {
    id: 5,
    tipo: 'progreso_bajo',
    prioridad: 'error',
    titulo: 'Múltiples estudiantes sin avance',
    mensaje: '8 estudiantes no han iniciado la sección Bibliografía',
    fechaCreacion: '2024-02-22T07:00:00Z',
    resuelta: false,
    datosAdicionales: { seccion: 'bibliografia', cantidad: 8 }
  }
];

export const MOCK_REPORTES: ReporteProgreso[] = [
  {
    estudiante: { id: 1, nombre: 'Juan Pérez', correo: 'juan.perez@ejemplo.com' },
    asignatura: { id: 1, nombre: 'Matemáticas Avanzadas' },
    progresoGlobal: 68.5,
    seccionesCompletadas: 5,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-20T14:30:00Z',
    tutor: { id: 2, nombre: 'María García' }
  },
  {
    estudiante: { id: 6, nombre: 'Laura Gómez', correo: 'laura.gomez@ejemplo.com' },
    asignatura: { id: 1, nombre: 'Matemáticas Avanzadas' },
    progresoGlobal: 82.3,
    seccionesCompletadas: 7,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-22T09:15:00Z',
    tutor: { id: 2, nombre: 'María García' }
  },
  {
    estudiante: { id: 5, nombre: 'Pedro Sánchez', correo: 'pedro.sanchez@ejemplo.com' },
    asignatura: { id: 2, nombre: 'Física Cuántica' },
    progresoGlobal: 15.0,
    seccionesCompletadas: 1,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-01T12:00:00Z',
    tutor: { id: 7, nombre: 'Diego Torres' }
  },
  {
    estudiante: { id: 8, nombre: 'Sofía Ramírez', correo: 'sofia.ramirez@ejemplo.com' },
    asignatura: { id: 1, nombre: 'Matemáticas Avanzadas' },
    progresoGlobal: 45.0,
    seccionesCompletadas: 3,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-18T11:00:00Z',
    tutor: { id: 2, nombre: 'María García' }
  },
  {
    estudiante: { id: 9, nombre: 'Andrés Morales', correo: 'andres.morales@ejemplo.com' },
    asignatura: { id: 2, nombre: 'Física Cuántica' },
    progresoGlobal: 92.0,
    seccionesCompletadas: 8,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-22T10:45:00Z',
    tutor: { id: 7, nombre: 'Diego Torres' }
  },
  {
    estudiante: { id: 10, nombre: 'Valentina López', correo: 'valentina.lopez@ejemplo.com' },
    asignatura: { id: 3, nombre: 'Química Orgánica' },
    progresoGlobal: 55.0,
    seccionesCompletadas: 4,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-19T16:20:00Z',
    tutor: { id: 4, nombre: 'Ana Martínez' }
  },
  {
    estudiante: { id: 11, nombre: 'Santiago Herrera', correo: 'santiago.herrera@ejemplo.com' },
    asignatura: { id: 3, nombre: 'Química Orgánica' },
    progresoGlobal: 30.0,
    seccionesCompletadas: 2,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-15T09:30:00Z',
    tutor: { id: 4, nombre: 'Ana Martínez' }
  },
  {
    estudiante: { id: 12, nombre: 'Camila Díaz', correo: 'camila.diaz@ejemplo.com' },
    asignatura: { id: 1, nombre: 'Matemáticas Avanzadas' },
    progresoGlobal: 100.0,
    seccionesCompletadas: 8,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-21T17:00:00Z',
    tutor: { id: 2, nombre: 'María García' }
  },
  {
    estudiante: { id: 13, nombre: 'Mateo Ruiz', correo: 'mateo.ruiz@ejemplo.com' },
    asignatura: { id: 2, nombre: 'Física Cuántica' },
    progresoGlobal: 38.0,
    seccionesCompletadas: 3,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-17T13:00:00Z',
    tutor: { id: 7, nombre: 'Diego Torres' }
  },
  {
    estudiante: { id: 14, nombre: 'Isabella Castro', correo: 'isabella.castro@ejemplo.com' },
    asignatura: { id: 3, nombre: 'Química Orgánica' },
    progresoGlobal: 75.0,
    seccionesCompletadas: 6,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-22T08:30:00Z',
    tutor: { id: 4, nombre: 'Ana Martínez' }
  },
  {
    estudiante: { id: 1, nombre: 'Juan Pérez', correo: 'juan.perez@ejemplo.com' },
    asignatura: { id: 3, nombre: 'Química Orgánica' },
    progresoGlobal: 22.0,
    seccionesCompletadas: 2,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-10T14:00:00Z',
    tutor: { id: 4, nombre: 'Ana Martínez' }
  },
  {
    estudiante: { id: 6, nombre: 'Laura Gómez', correo: 'laura.gomez@ejemplo.com' },
    asignatura: { id: 2, nombre: 'Física Cuántica' },
    progresoGlobal: 60.0,
    seccionesCompletadas: 5,
    seccionesTotales: 8,
    ultimaActividad: '2024-02-21T12:00:00Z',
    tutor: { id: 7, nombre: 'Diego Torres' }
  }
];

export const MOCK_ESTUDIANTES_BITACORA: EstudianteBitacora[] = [
  { id: 1, nombre: 'Juan Pérez', correo: 'juan.perez@ejemplo.com', progresoGlobal: 68.5, asignatura: 'Matemáticas Avanzadas', tutor: 'María García', ultimaActividad: '2024-02-20T14:30:00Z' },
  { id: 6, nombre: 'Laura Gómez', correo: 'laura.gomez@ejemplo.com', progresoGlobal: 82.3, asignatura: 'Matemáticas Avanzadas', tutor: 'María García', ultimaActividad: '2024-02-22T09:15:00Z' },
  { id: 5, nombre: 'Pedro Sánchez', correo: 'pedro.sanchez@ejemplo.com', progresoGlobal: 15.0, asignatura: 'Física Cuántica', tutor: 'Diego Torres', ultimaActividad: '2024-02-01T12:00:00Z' },
  { id: 8, nombre: 'Sofía Ramírez', correo: 'sofia.ramirez@ejemplo.com', progresoGlobal: 45.0, asignatura: 'Matemáticas Avanzadas', tutor: 'María García', ultimaActividad: '2024-02-18T11:00:00Z' },
  { id: 9, nombre: 'Andrés Morales', correo: 'andres.morales@ejemplo.com', progresoGlobal: 92.0, asignatura: 'Física Cuántica', tutor: 'Diego Torres', ultimaActividad: '2024-02-22T10:45:00Z' },
  { id: 10, nombre: 'Valentina López', correo: 'valentina.lopez@ejemplo.com', progresoGlobal: 55.0, asignatura: 'Química Orgánica', tutor: 'Ana Martínez', ultimaActividad: '2024-02-19T16:20:00Z' },
  { id: 11, nombre: 'Santiago Herrera', correo: 'santiago.herrera@ejemplo.com', progresoGlobal: 30.0, asignatura: 'Química Orgánica', tutor: 'Ana Martínez', ultimaActividad: '2024-02-15T09:30:00Z' },
  { id: 12, nombre: 'Camila Díaz', correo: 'camila.diaz@ejemplo.com', progresoGlobal: 100.0, asignatura: 'Matemáticas Avanzadas', tutor: 'María García', ultimaActividad: '2024-02-21T17:00:00Z' },
  { id: 13, nombre: 'Mateo Ruiz', correo: 'mateo.ruiz@ejemplo.com', progresoGlobal: 38.0, asignatura: 'Física Cuántica', tutor: 'Diego Torres', ultimaActividad: '2024-02-17T13:00:00Z' },
  { id: 14, nombre: 'Isabella Castro', correo: 'isabella.castro@ejemplo.com', progresoGlobal: 75.0, asignatura: 'Química Orgánica', tutor: 'Ana Martínez', ultimaActividad: '2024-02-22T08:30:00Z' }
];

export const MOCK_USUARIO_LIST: Usuario[] = MOCK_USUARIOS;

export const MOCK_ASIGNATURA_LIST: AsignaturaListResponse = {
  asignaturas: MOCK_ASIGNATURAS,
  total: MOCK_ASIGNATURAS.length
};
