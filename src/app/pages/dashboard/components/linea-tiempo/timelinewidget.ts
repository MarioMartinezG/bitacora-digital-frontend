import { Component } from '@angular/core';
import { Timeline } from 'primeng/timeline';

@Component({
    selector: 'app-timeline-widget',
    templateUrl: './timelinewidget.html',
    standalone: true,
    imports: [Timeline]

})
export class TimelineWidget {
    schedule: any[];


constructor() {

    this.schedule = [
            { moment: 'Momento 1', date: '23/02/2025',modules:["Diseño de cirsos integrados","Atención a los factores situacionales"]},
            { moment: 'Momento 2', date: '02/03/2025', modules:["Apropiación de los resultados de aprencizaje del curso"] },
            { moment: 'Momento 3', date: '09/03/2025', modules:["Diseño de actividades de aprendizaje", "Diseño de la evaluación"]},
            { moment: 'Momento 4', date: '23/03/2025',modules:["Secuencia estructurada de las actividades del curso"]}
        ];
    }
}

