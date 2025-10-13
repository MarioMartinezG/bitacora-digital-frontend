import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { Rapwidget } from './components/rap/rapwidget';
import { Racwidget } from './components/rac/racwidget';

@Component({
    selector: 'app-rap-rac-component',
    imports: [AccordionModule, CardModule, Racwidget, Rapwidget, TagModule],
    templateUrl: './rap-rac-component.html',
})
export class RapRacComponent {

}
