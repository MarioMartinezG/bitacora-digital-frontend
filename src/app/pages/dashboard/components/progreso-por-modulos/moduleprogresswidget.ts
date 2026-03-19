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
    { seccionCodigo: 'observar',    nombre: 'Observar, registrar y actuar de manera oportuna', momento: 'Módulo 1', color: '#8b5cf6', porcentaje: 0 },
    { seccionCodigo: 'caracteriza', nombre: 'Identificación de tu curso',                       momento: 'Módulo 2', color: '#f97316', porcentaje: 0 },
    { seccionCodigo: 'factores',    nombre: 'Factores Situacionales',                           momento: 'Módulo 3', color: '#06b6d4', porcentaje: 0 },
    { seccionCodigo: 'actividades', nombre: 'Actividades de Aprendizaje',                       momento: 'Módulo 4', color: '#a855f7', porcentaje: 0 },
    { seccionCodigo: 'evaluacion',  nombre: 'Diseño de la evaluación',                          momento: 'Módulo 5', color: '#14b8a6', porcentaje: 0 },
    { seccionCodigo: 'secuencia',   nombre: 'Secuencia y cronograma',                           momento: 'Módulo 6', color: '#3b82f6', porcentaje: 0 },
    { seccionCodigo: 'calificacion',nombre: 'Calificación',                                     momento: 'Módulo 7', color: '#22c55e', porcentaje: 0 },
    { seccionCodigo: 'bibliografia',nombre: 'Medios educativos',                                momento: 'Módulo 8', color: '#6366f1', porcentaje: 0 }
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
