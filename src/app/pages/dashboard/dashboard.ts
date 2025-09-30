import { Component } from '@angular/core';
import { NotificationsWidget } from './components/notificationswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { TimelineWidget} from './components/linea-tiempo/timelinewidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { Generalprogresswidget } from './components/barra-progreso-general/generalprogresswidget';


@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, NotificationsWidget, TimelineWidget, Generalprogresswidget],
    templateUrl: 'dashboard.html'

})
export class Dashboard {}
