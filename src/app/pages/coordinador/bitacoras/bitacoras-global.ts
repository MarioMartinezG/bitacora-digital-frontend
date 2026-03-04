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
  selector: 'app-bitacoras-global',
  templateUrl: './bitacoras-global.html',
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
export class BitacorasGlobal implements OnInit {
  estudiantes = signal<ReporteProgreso[]>([]);
  cargando = signal(false);
  filtroTutor = signal<string | null>(null);
  tutorOptions = signal<FiltroOption[]>([]);

  estudiantesFiltrados = computed(() => {
    let data = this.estudiantes();
    const tutor = this.filtroTutor();
    if (tutor !== null) {
      data = data.filter(e => e.tutorNombre === tutor);
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
        this.estudiantes.set(data);
        const tutores = new Set<string>();
        for (const r of data) {
          if (r.tutorNombre) tutores.add(r.tutorNombre);
        }
        this.tutorOptions.set([
          { label: 'Todos los tutores', value: null },
          ...Array.from(tutores).map(nombre => ({ label: nombre, value: nombre }))
        ]);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los datos de las bitácoras',
          life: 3000
        });
      }
    });
  }

  onFiltroTutorChange(value: string | null): void {
    this.filtroTutor.set(value);
  }

  limpiarFiltros(): void {
    this.filtroTutor.set(null);
  }

  verBitacora(estudiante: ReporteProgreso): void {
    this.router.navigate(['/home/coordinador/bitacoras', estudiante.estudianteId]);
  }

  getProgresoSeverity(progreso: number): 'success' | 'info' | 'warn' | 'danger' {
    if (progreso >= 75) return 'success';
    if (progreso >= 50) return 'info';
    if (progreso >= 25) return 'warn';
    return 'danger';
  }
}
