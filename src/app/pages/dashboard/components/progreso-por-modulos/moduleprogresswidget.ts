import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RespuestaSeccionDTO } from '../../../../core/models';

interface ModuloProgreso {
  seccionCodigo: string;
  nombre: string;
  momento: string;
  color: string;
  porcentaje: number;
}

@Component({
  standalone: true,
  selector: 'app-moduleprogress-widget',
  templateUrl: './moduleprogresswidget.html'
})
export class ModuleProgressWidget implements OnChanges {
  @Input() secciones: Record<string, RespuestaSeccionDTO> = {};

  modulos: ModuloProgreso[] = [
    { seccionCodigo: 'caracteriza', nombre: 'Caracteriza tu asignatura', momento: 'Momento 1', color: '#f97316', porcentaje: 0 },
    { seccionCodigo: 'factores', nombre: 'Factores situacionales', momento: 'Momento 1', color: '#06b6d4', porcentaje: 0 },
    { seccionCodigo: 'ajustes', nombre: 'Ambientes sanos y seguros', momento: 'Momento 2', color: '#ec4899', porcentaje: 0 },
    { seccionCodigo: 'rap-rac', nombre: 'RAP y RAC', momento: 'Momento 2', color: '#22c55e', porcentaje: 0 },
    { seccionCodigo: 'actividades', nombre: 'Actividades de aprendizaje', momento: 'Momento 3', color: '#a855f7', porcentaje: 0 },
    { seccionCodigo: 'evaluacion', nombre: 'Cómo evaluaré', momento: 'Momento 3', color: '#14b8a6', porcentaje: 0 },
    { seccionCodigo: 'secuencia', nombre: 'Secuencia del curso', momento: 'Momento 4', color: '#3b82f6', porcentaje: 0 },
    { seccionCodigo: 'bibliografia', nombre: 'Bibliografía y medios educativos', momento: 'Momento 4', color: '#6366f1', porcentaje: 0 }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['secciones']) {
      this.actualizarPorcentajes();
    }
  }

  private actualizarPorcentajes(): void {
    this.modulos.forEach(modulo => {
      const seccion = this.secciones[modulo.seccionCodigo];
      modulo.porcentaje = seccion?.progresoPorcentaje ?? 0;
    });
  }
}
