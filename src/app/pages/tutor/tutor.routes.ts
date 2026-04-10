import { Routes } from '@angular/router';
import { TutorRevision } from './revision/tutor-revision';
import { TutorRevisionDetalle } from './revision/tutor-revision-detalle';
import { TutorRevisionSeccion } from './revision/tutor-revision-seccion';
import { TutorSolicitudesSesion } from './solicitudes-sesion/tutor-solicitudes-sesion';
import { ConfiguracionAlertas } from './configuracion-alertas/configuracion-alertas';

export default [
    { path: 'revision', component: TutorRevision },
    { path: 'revision/:estudianteId', component: TutorRevisionDetalle },
    { path: 'revision/:estudianteId/seccion/:seccionCodigo', component: TutorRevisionSeccion },
    { path: 'solicitudes-sesion', component: TutorSolicitudesSesion },
    { path: 'configuracion-alertas', component: ConfiguracionAlertas }
] as Routes;
