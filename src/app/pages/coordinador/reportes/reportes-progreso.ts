import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Select } from 'primeng/select';
import { ProgressBar } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ReporteProgreso } from '../../../core/models';
import { EstadisticasService } from '../../../core/services/estadisticas.service';

interface FiltroOption {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-reportes-progreso',
  templateUrl: './reportes-progreso.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    Select,
    ProgressBar,
    TooltipModule,
    SkeletonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class ReportesProgreso implements OnInit {
  reportes = signal<ReporteProgreso[]>([]);
  cargando = signal(false);

  filtroTutor = signal<string | null>(null);
  tutorOptions = signal<FiltroOption[]>([]);

  reportesFiltrados = computed(() => {
    let data = this.reportes();
    const tutorNombre = this.filtroTutor();
    if (tutorNombre !== null) {
      data = data.filter(r => r.tutorNombre === tutorNombre);
    }
    return data;
  });

  constructor(
    private router: Router,
    private estadisticasService: EstadisticasService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    this.cargando.set(true);
    this.estadisticasService.obtenerReportesProgreso().subscribe({
      next: (data) => {
        this.reportes.set(data);
        this.buildFilterOptions(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los reportes de progreso',
          life: 3000
        });
      }
    });
  }

  private buildFilterOptions(reportes: ReporteProgreso[]): void {
    const tutores = new Set<string>();
    for (const r of reportes) {
      if (r.tutorNombre) tutores.add(r.tutorNombre);
    }
    this.tutorOptions.set([
      { label: 'Todos los tutores', value: null },
      ...Array.from(tutores).map(nombre => ({ label: nombre, value: nombre }))
    ]);
  }

  onFiltroTutorChange(value: string | null): void {
    this.filtroTutor.set(value);
  }

  limpiarFiltros(): void {
    this.filtroTutor.set(null);
  }

  verBitacora(reporte: ReporteProgreso): void {
    this.router.navigate(['/home/coordinador/bitacoras', reporte.estudianteId]);
  }

  getSeccionesCompletadas(reporte: ReporteProgreso): number {
    return reporte.secciones?.filter(s => s.estado === 'completado').length ?? 0;
  }

  getProgresoSeverity(progreso: number): 'success' | 'info' | 'warn' | 'danger' {
    if (progreso >= 75) return 'success';
    if (progreso >= 50) return 'info';
    if (progreso >= 25) return 'warn';
    return 'danger';
  }

  getProgresoLabel(progreso: number): string {
    if (progreso >= 75) return 'Alto';
    if (progreso >= 50) return 'Medio';
    if (progreso >= 25) return 'Bajo';
    return 'Crítico';
  }

  exportarPDF(): void {
    const datos = this.reportesFiltrados();
    const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    const filas = datos.map(r => `
      <tr>
        <td><strong>${r.estudianteNombre ?? ''}</strong><br><span class="sub">${r.estudianteCorreo ?? ''}</span></td>
        <td>${r.tutorNombre ?? 'Sin asignar'}</td>
        <td>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width:${r.porcentajeGeneral ?? 0}%"></div>
          </div>
          <span class="pct">${(r.porcentajeGeneral ?? 0).toFixed(0)}%</span>
        </td>
        <td class="center">${this.getSeccionesCompletadas(r)} / 8</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Reportes de Progreso</title>
  <style>
    @page { size: A4 landscape; margin: 1.5cm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #1e293b; margin: 0; }
    .doc-header { border-bottom: 2px solid #006B3C; margin-bottom: 1.2rem; padding-bottom: 0.8rem; }
    .doc-brand { font-size: 8pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .doc-header h1 { margin: 0 0 0.3rem 0; font-size: 15pt; color: #1e293b; }
    .doc-meta { display: flex; gap: 2rem; font-size: 9pt; color: #475569; }
    table { width: 100%; border-collapse: collapse; font-size: 9pt; }
    th { background: #f1f5f9; font-weight: 600; border: 1px solid #cbd5e1; padding: 0.4rem 0.6rem; text-align: left; }
    td { border: 1px solid #e2e8f0; padding: 0.4rem 0.6rem; vertical-align: middle; }
    .sub { font-size: 8pt; color: #64748b; }
    .center { text-align: center; }
    .progress-bar-wrap { background: #e2e8f0; border-radius: 4px; height: 6px; width: 100px; display: inline-block; vertical-align: middle; margin-right: 6px; }
    .progress-bar-fill { background: #006B3C; height: 100%; border-radius: 4px; }
    .pct { font-weight: 600; }
    tr:nth-child(even) td { background: #f8fafc; }
  </style>
</head>
<body>
  <div class="doc-header">
    <div class="doc-brand">Bitácora Digital — En sus marcas, listos, RAC!</div>
    <h1>Reporte de Progreso de Estudiantes</h1>
    <div class="doc-meta">
      <span>Exportado el ${fecha}</span>
      <span>Total de registros: ${datos.length}</span>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Estudiante</th>
        <th>Tutor</th>
        <th>Progreso</th>
        <th>Secciones completadas</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>
</body>
</html>`;

    const ventana = window.open('', '_blank', 'width=1100,height=800');
    if (!ventana) return;
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => { ventana.print(); }, 500);
  }
}
