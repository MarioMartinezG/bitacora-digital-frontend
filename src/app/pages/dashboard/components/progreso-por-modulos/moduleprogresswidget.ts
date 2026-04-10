import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RespuestaSeccionDTO } from '../../../../core/models';
import { ProgresoSeccionDTO } from '../../../../core/models/estudiante-progreso.model';

type EtiquetaTipo = 'aprobado' | 'en_revision' | 'correcciones' | null;

interface ModuloProgreso {
  seccionCodigo: string;
  nombre: string;
  momento: string;
  color: string;
  porcentaje: number;
  etiqueta: EtiquetaTipo;
}

@Component({
  standalone: true,
  selector: 'app-moduleprogress-widget',
  templateUrl: './moduleprogresswidget.html'
})
export class ModuleProgressWidget implements OnChanges {
  @Input() secciones: Record<string, RespuestaSeccionDTO> = {};
  @Input() progresoSecciones: Record<string, ProgresoSeccionDTO> = {};
  @Input() umbral = 80;

  modulos: ModuloProgreso[] = [
    { seccionCodigo: 'observar',    nombre: 'Observar, registrar y actuar de manera oportuna', momento: 'Módulo 1', color: '#8b5cf6', porcentaje: 0, etiqueta: null },
    { seccionCodigo: 'caracteriza', nombre: 'Identificación de tu curso',                       momento: 'Módulo 2', color: '#f97316', porcentaje: 0, etiqueta: null },
    { seccionCodigo: 'factores',    nombre: 'Factores Situacionales',                           momento: 'Módulo 3', color: '#06b6d4', porcentaje: 0, etiqueta: null },
    { seccionCodigo: 'actividades', nombre: 'Actividades de Aprendizaje',                       momento: 'Módulo 4', color: '#a855f7', porcentaje: 0, etiqueta: null },
    { seccionCodigo: 'evaluacion',  nombre: 'Diseño de la evaluación',                          momento: 'Módulo 5', color: '#14b8a6', porcentaje: 0, etiqueta: null },
    { seccionCodigo: 'secuencia',   nombre: 'Secuencia y cronograma',                           momento: 'Módulo 6', color: '#3b82f6', porcentaje: 0, etiqueta: null },
    { seccionCodigo: 'calificacion',nombre: 'Calificación',                                     momento: 'Módulo 7', color: '#22c55e', porcentaje: 0, etiqueta: null },
    { seccionCodigo: 'bibliografia',nombre: 'Medios educativos',                                momento: 'Módulo 8', color: '#6366f1', porcentaje: 0, etiqueta: null }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['secciones'] || changes['progresoSecciones'] || changes['umbral']) {
      this.actualizarModulos();
    }
  }

  private actualizarModulos(): void {
    this.modulos.forEach(modulo => {
      const seccion = this.secciones[modulo.seccionCodigo];
      const progreso = this.progresoSecciones[modulo.seccionCodigo];
      const raw = seccion?.progresoPorcentaje ?? progreso?.porcentaje ?? 0;
      const estadoProfesor = progreso?.estadoProfesor;
      const revisado = progreso?.revisado ?? false;

      modulo.porcentaje = this.porcentajeEfectivo(raw, estadoProfesor, revisado);
      modulo.etiqueta = this.calcularEtiqueta(raw, estadoProfesor, revisado);
    });
  }

  private porcentajeEfectivo(raw: number, estadoProfesor?: string | null, revisado?: boolean): number {
    if (revisado) return raw;
    if (!estadoProfesor || estadoProfesor === 'completado') return raw;
    // El tutor marcó correcciones: mostrar progreso real pero máximo 90%
    return Math.min(raw, 90);
  }

  private calcularEtiqueta(raw: number, estadoProfesor?: string | null, revisado?: boolean): EtiquetaTipo {
    if (revisado) return 'aprobado';
    if (estadoProfesor && estadoProfesor !== 'completado') return 'correcciones';
    if (raw >= this.umbral) return 'en_revision';
    return null;
  }
}
