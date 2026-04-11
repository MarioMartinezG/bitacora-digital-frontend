// Modulos Angular
import { Routes } from '@angular/router';

//Guards
import { authGuard } from './app/core/guards/auth-guard';

// Componentes
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { Notificaciones } from './app/pages/notificaciones/notificaciones';
import { SolicitudesSesion } from './app/pages/solicitudes-sesion/solicitudes-sesion';
import { DocumentosGuia } from './app/pages/documentos-guia/documentos-guia';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'bitacora', loadChildren: () => import('./app/pages/bitacora/bitacora.routes') },
            { path: 'notificaciones', component: Notificaciones },
            { path: 'solicitudes-sesion', component: SolicitudesSesion },
            { path: 'documentos-guia', component: DocumentosGuia, data: { roles: [1] } },
            { path: 'tutor', loadChildren: () => import('./app/pages/tutor/tutor.routes'), data: { roles: [2, 3] } },
            { path: 'coordinador', loadChildren: () => import('./app/pages/coordinador/coordinador.routes'), data: { roles: [3] } },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ],
        canActivate: [authGuard]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
