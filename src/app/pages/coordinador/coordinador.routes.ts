import { Routes } from '@angular/router';

export default [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full' as const
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/coordinador-dashboard').then(m => m.CoordinadorDashboard)
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./usuarios/usuarios-list').then(m => m.UsuariosList)
  },
  {
    path: 'usuarios/nuevo',
    loadComponent: () => import('./usuarios/usuario-form').then(m => m.UsuarioForm)
  },
  {
    path: 'usuarios/:id',
    loadComponent: () => import('./usuarios/usuario-detalle').then(m => m.UsuarioDetalle)
  },
  {
    path: 'usuarios/:id/editar',
    loadComponent: () => import('./usuarios/usuario-form').then(m => m.UsuarioForm)
  },
  {
    path: 'reportes',
    loadComponent: () => import('./reportes/reportes-progreso').then(m => m.ReportesProgreso)
  },
  {
    path: 'bitacoras',
    loadComponent: () => import('./bitacoras/bitacoras-global').then(m => m.BitacorasGlobal)
  },
  {
    path: 'bitacoras/:estudianteId',
    loadComponent: () => import('./bitacoras/bitacora-estudiante-view').then(m => m.BitacoraEstudianteView)
  },
  {
    path: 'bitacoras/:estudianteId/seccion/:seccionCodigo',
    loadComponent: () => import('./bitacoras/bitacora-seccion-view').then(m => m.BitacoraSeccionView)
  },
  {
    path: 'asignaturas',
    loadComponent: () => import('./asignaturas/asignaturas-list').then(m => m.AsignaturasList)
  },
  {
    path: 'asignaciones',
    loadComponent: () => import('./asignaciones/asignaciones-list').then(m => m.AsignacionesList)
  },
  {
    path: 'asignaturas/nueva',
    loadComponent: () => import('./asignaturas/asignatura-form').then(m => m.AsignaturaForm)
  },
  {
    path: 'asignaturas/:id',
    loadComponent: () => import('./asignaturas/asignatura-detalle').then(m => m.AsignaturaDetalle)
  },
  {
    path: 'asignaturas/:id/editar',
    loadComponent: () => import('./asignaturas/asignatura-form').then(m => m.AsignaturaForm)
  }
] as Routes;
