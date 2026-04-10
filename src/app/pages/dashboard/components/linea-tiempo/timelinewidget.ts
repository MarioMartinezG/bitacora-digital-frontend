import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timeline } from 'primeng/timeline';
import { SkeletonModule } from 'primeng/skeleton';
import { MomentoService } from '../../../../core/services/momento.service';

const SECCIONES: { label: string; value: string }[] = [
  { label: 'Identificación de tu curso', value: 'caracteriza-asignatura' },
  { label: 'Factores Situacionales', value: 'factores-situacionales' },
  { label: 'Actividades de Aprendizaje', value: 'actividades-aprendizaje' },
  { label: 'Diseño de la evaluación', value: 'como-evaluare' },
  { label: 'Calificación', value: 'calificacion' },
  { label: 'Secuencia del Curso', value: 'secuencia-curso' },
  { label: 'Bibliografía y medios educativos', value: 'bibliografia' }
];

@Component({
  selector: 'app-timeline-widget',
  templateUrl: './timelinewidget.html',
  standalone: true,
  imports: [CommonModule, Timeline, SkeletonModule]
})
export class TimelineWidget implements OnInit {
  schedule = signal<any[]>([]);
  cargando = signal(false);

  constructor(private momentoService: MomentoService) {}

  ngOnInit(): void {
    this.cargando.set(true);
    this.momentoService.obtenerMomentos().subscribe({
      next: (momentos) => {
        this.schedule.set(
          momentos.map(dto => ({
            moment: dto.nombre,
            date: this.formatFecha(dto.fechaLimite),
            modules: dto.secciones.map(s => this.getSeccionLabel(s))
          }))
        );
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  getSeccionLabel(codigo: string): string {
    return SECCIONES.find(s => s.value === codigo)?.label ?? codigo;
  }

  formatFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-');
    return `${day}/${month}/${year}`;
  }
}
