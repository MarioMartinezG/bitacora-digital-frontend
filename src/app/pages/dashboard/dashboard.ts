import { Component } from '@angular/core';
import { NotificationsWidget } from './components/notificaciones/notificationswidget';
import { TimelineWidget} from './components/linea-tiempo/timelinewidget';
import { Generalprogresswidget } from './components/barra-progreso-general/generalprogresswidget';
import {ModuleProgressWidget} from './components/progreso-por-modulos/moduleprogresswidget'


@Component({
    selector: 'app-dashboard',
    imports: [NotificationsWidget, TimelineWidget, Generalprogresswidget,ModuleProgressWidget],
    templateUrl: 'dashboard.html'

})
export class Dashboard {}
