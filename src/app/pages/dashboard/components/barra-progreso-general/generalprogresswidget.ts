import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ProgressBar } from 'primeng/progressbar';
import { RespuestaSeccionDTO } from '../../../../core/models';

const SECCIONES_CODIGOS = [
  'observar', 'caracteriza', 'factores', 'actividades',
  'evaluacion', 'secuencia', 'calificacion', 'bibliografia'
];

@Component({
  selector: 'app-generalprogress-widget',
  templateUrl: './generalprogresswidget.html',
  imports: [ProgressBar]
})
export class Generalprogresswidget implements OnChanges {
  @Input() secciones: Record<string, RespuestaSeccionDTO> = {};

  progresoGeneral = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['secciones']) {
      this.calcularProgresoGeneral();
    }
  }

  private calcularProgresoGeneral(): void {
    const suma = SECCIONES_CODIGOS.reduce((total, codigo) => {
      return total + (this.secciones[codigo]?.progresoPorcentaje ?? 0);
    }, 0);
    this.progresoGeneral = Math.round(suma / SECCIONES_CODIGOS.length);
  }
}
