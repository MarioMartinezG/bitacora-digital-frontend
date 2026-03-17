import { Component } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { MomentosWidget } from './components/momentos/momentos-widget';
import { AlertasWidget } from './components/alertas/alertas-widget';
import { ProgramasWidget } from './components/programas/programas-widget';
import { EvaluacionWidget } from './components/evaluacion/evaluacion-widget';
import { AprendizajeWidget } from './components/aprendizaje/aprendizaje-widget';

@Component({
  selector: 'app-parametrizaciones',
  templateUrl: './parametrizaciones.html',
  standalone: true,
  imports: [TabsModule, MomentosWidget, AlertasWidget, ProgramasWidget, EvaluacionWidget, AprendizajeWidget]
})
export class Parametrizaciones {}
