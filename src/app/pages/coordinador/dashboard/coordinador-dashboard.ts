import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { FieldsetModule } from 'primeng/fieldset';
import { MessageService } from 'primeng/api';
import { EstadisticasGenerales, AlertaSistema } from '../../../core/models';
import { EstadisticasService } from '../../../core/services/estadisticas.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-coordinador-dashboard',
  templateUrl: './coordinador-dashboard.html',
  standalone: true,
  imports: [
    CommonModule,
    TagModule,
    ButtonModule,
    ProgressBar,
    ChartModule,
    SkeletonModule,
    ToastModule,
    FieldsetModule,
  ],
  providers: [MessageService]
})
export class CoordinadorDashboard implements OnInit {
  estadisticas = signal<EstadisticasGenerales | null>(null);
  alertas = signal<AlertaSistema[]>([]);
  loading = signal(true);

  alertasPendientes = computed(() =>
    this.alertas().filter(a => !a.resuelta).slice(0, 5)
  );

  seccionesOrdenadas = computed(() => {
    const stats = this.estadisticas();
    if (!stats) return [];
    return [...stats.progresosPorSeccion].sort((a, b) => b.porcentajeCompletado - a.porcentajeCompletado);
  });

  chartData = computed(() => {
    const stats = this.estadisticas();
    if (!stats) return null;
    const secciones = stats.progresosPorSeccion;
    return {
      labels: secciones.map(s => s.seccionNombre),
      datasets: [{
        label: 'Progreso promedio (%)',
        data: secciones.map(s => Math.round(s.promedioProgreso)),
        backgroundColor: secciones.map(s =>
          s.promedioProgreso >= 75 ? '#22c55e' :
          s.promedioProgreso >= 40 ? '#f97316' : '#ef4444'
        ),
        borderRadius: 4
      }]
    };
  });

  chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.raw}%`
        }
      }
    },
    scales: {
      x: {
        min: 0,
        max: 100,
        ticks: { callback: (v: any) => v + '%' },
        title: { display: true, text: 'Progreso promedio del grupo' }
      },
      y: {
        ticks: {
          font: { size: 11 },
          callback: function(this: any, _value: any, index: number) {
            const label = this.getLabelForValue(index) as string;
            return label.length > 28 ? label.substring(0, 28) + '…' : label;
          }
        }
      }
    }
  };

  statsCards = computed(() => {
    const stats = this.estadisticas();
    if (!stats) return [];
    return [
      { label: 'Estudiantes', value: stats.totalEstudiantes, icon: 'pi pi-users', color: 'blue' },
      { label: 'Tutores', value: stats.totalTutores, icon: 'pi pi-user', color: 'green' },
      { label: 'Progreso promedio', value: Math.round(stats.promedioProgreso) + '%', icon: 'pi pi-chart-line', color: 'orange' },
      { label: 'Alertas pendientes', value: stats.alertasPendientes, icon: 'pi pi-bell', color: 'red' }
    ];
  });

  constructor(
    private estadisticasService: EstadisticasService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.loading.set(true);
    forkJoin({
      estadisticas: this.estadisticasService.obtenerEstadisticasGenerales(),
      alertas: this.estadisticasService.obtenerAlertas()
    }).subscribe({
      next: ({ estadisticas, alertas }) => {
        this.estadisticas.set(estadisticas);
        this.alertas.set(alertas);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos del dashboard'
        });
      }
    });
  }

  resolverAlerta(alerta: AlertaSistema): void {
    this.estadisticasService.resolverAlerta(alerta.id).subscribe({
      next: () => {
        this.alertas.update(list =>
          list.map(a => a.id === alerta.id ? { ...a, resuelta: true } : a)
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Alerta resuelta',
          detail: alerta.titulo
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo resolver la alerta'
        });
      }
    });
  }

  getPrioridadSeverity(prioridad: string): 'danger' | 'warn' | 'info' | 'secondary' {
    const map: Record<string, 'danger' | 'warn' | 'info' | 'secondary'> = {
      critical: 'danger',
      error: 'danger',
      warning: 'warn',
      info: 'info'
    };
    return map[prioridad] ?? 'secondary';
  }

  getPrioridadLabel(prioridad: string): string {
    const map: Record<string, string> = {
      critical: 'CRÍTICO',
      error: 'ERROR',
      warning: 'ALERTA',
      info: 'INFO'
    };
    return map[prioridad] ?? prioridad.toUpperCase();
  }

  getTipoIcon(tipo: string): string {
    const map: Record<string, string> = {
      estudiante_inactivo: 'pi pi-user-minus',
      progreso_bajo: 'pi pi-chart-line',
      sesion_pendiente: 'pi pi-clock',
      error_sistema: 'pi pi-exclamation-triangle'
    };
    return map[tipo] ?? 'pi pi-info-circle';
  }
}
