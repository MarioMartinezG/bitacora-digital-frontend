import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { KnobModule } from 'primeng/knob';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';
import { calcularEstadoAvance } from '../../../core/models';

@Component({
  selector: 'app-secuencia-curso-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    FluidModule,
    MultiSelectModule,
    InputNumberModule,
    TextareaModule,
    KnobModule,
    TagModule,
    SelectModule,
    ChartModule,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    BitacoraCommentButtonComponent
  ],
  templateUrl: './secuencia-curso-component.html',
  styleUrl: './secuencia-curso-component.css'
})
export class SecuenciaCursoComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  protected seccionCodigo = 'secuencia';
  protected sectionsConfig: SectionConfig[] = [];

  // Datos base
  creditosAsignatura = 3;
  horasTotales = this.creditosAsignatura * 48;

  // Horas calculadas
  horasUsadas = 0;
  horasDisponibles = this.horasTotales;
  horasAsignadas = 0;
  porcentajeHorasAsignadas = 0;
  horasAsync = 0;
  horasSync = 0;

  // Chart
  chartData: any;
  chartOptions: any;

  // Opciones
  tiposActividad = [
    { label: 'Asíncrona', value: 'async' },
    { label: 'Síncrona', value: 'sync' }
  ];

  actividadesOpciones = [
    { label: 'Lectura de material', value: 'lectura' },
    { label: 'Video educativo', value: 'video' },
    { label: 'Taller práctico', value: 'taller' },
    { label: 'Debate grupal', value: 'debate' },
    { label: 'Exposición', value: 'exposicion' },
    { label: 'Trabajo colaborativo', value: 'colaborativo' },
    { label: 'Evaluación', value: 'evaluacion' },
    { label: 'Foro de discusión', value: 'foro' },
    { label: 'Estudio de caso', value: 'caso' },
    { label: 'Proyecto', value: 'proyecto' }
  ];

  get secuenciaFormArray(): FormArray {
    return this.form.get('secuenciaCurso') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.inicializarChart();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      secuenciaCurso: this.fb.array([])
    });
  }

  /**
   * Override setupProgressTracking para incluir recálculo de horas
   */
  protected override setupProgressTracking(): void {
    this.form.valueChanges.subscribe(() => {
      this.recalcularHoras();
      this.calculateProgress();
    });
  }

  agregarFila(): void {
    this.secuenciaFormArray.push(this.fb.group({
      modulo: [''],
      actividades: [[]],
      descripcion: [''],
      tipo: [null],
      horas: [0]
    }));
    this.recalcularHoras();
    this.calculateProgress();
  }

  eliminarFila(index: number): void {
    this.secuenciaFormArray.removeAt(index);
    this.recalcularHoras();
    this.calculateProgress();
  }

  /**
   * Override patchFormWithData para cargar filas en el FormArray
   */
  protected override patchFormWithData(data: any): void {
    if (data?.secuenciaCurso && Array.isArray(data.secuenciaCurso)) {
      const formArray = this.secuenciaFormArray;
      formArray.clear();
      data.secuenciaCurso.forEach((fila: any) => {
        formArray.push(this.fb.group({
          modulo: [fila.modulo || ''],
          actividades: [fila.actividades || []],
          descripcion: [fila.descripcion || ''],
          tipo: [fila.tipo || null],
          horas: [fila.horas || 0]
        }));
      });
    }
    this.recalcularHoras();
  }

  /**
   * Progreso binario: tiene al menos 1 fila = completado, 0 filas = sin_avances
   */
  protected override calculateProgress(): void {
    const hasRows = this.secuenciaFormArray.length > 0;
    const percentage = hasRows ? 100 : 0;

    this._progress.set({
      sections: [
        {
          sectionName: 'secuencia',
          completedFields: hasRows ? 1 : 0,
          totalFields: 1,
          percentage,
          estado: calcularEstadoAvance(percentage)
        }
      ],
      totalPercentage: percentage,
      estado: calcularEstadoAvance(percentage)
    });
  }

  // --- Cálculos de horas ---

  inicializarChart(): void {
    this.chartData = {
      labels: ['Independiente', 'Directo'],
      datasets: [
        {
          data: [this.horasAsync, this.horasSync],
          backgroundColor: ['#22c55e', '#f97316'],
          hoverBackgroundColor: ['#16a34a', '#ea580c']
        }
      ]
    };

    this.chartOptions = {
      cutout: '60%',
      plugins: {
        legend: { display: false }
      }
    };
  }

  recalcularHoras(): void {
    const filas = this.secuenciaFormArray.value;

    this.horasAsync = filas
      .filter((f: any) => f.tipo === 'async')
      .reduce((total: number, f: any) => total + (f.horas || 0), 0);

    this.horasSync = filas
      .filter((f: any) => f.tipo === 'sync')
      .reduce((total: number, f: any) => total + (f.horas || 0), 0);

    this.horasAsignadas = this.horasAsync + this.horasSync;
    this.horasDisponibles = Math.max(this.horasTotales - this.horasAsignadas, 0);

    this.porcentajeHorasAsignadas = this.horasTotales > 0
      ? Math.round((this.horasAsignadas / this.horasTotales) * 100)
      : 0;

    this.actualizarChart();
  }

  actualizarChart(): void {
    this.chartData = {
      labels: ['Independiente', 'Directo'],
      datasets: [
        {
          data: [this.horasAsync, this.horasSync],
          backgroundColor: ['#22c55e', '#f97316'],
          hoverBackgroundColor: ['#16a34a', '#ea580c']
        }
      ]
    };
  }
}
