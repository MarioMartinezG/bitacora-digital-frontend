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
    path: 'asignaciones',
    loadComponent: () => import('./asignaciones/asignaciones-list').then(m => m.AsignacionesList)
  },
  {
    path: 'parametrizaciones',
    loadComponent: () => import('./parametrizaciones/parametrizaciones').then(m => m.Parametrizaciones)
  },
  {
    path: 'tutor',
    loadComponent: () => import('./tutor/tutor-ia').then(m => m.TutorIa)
  }
] as Routes;
