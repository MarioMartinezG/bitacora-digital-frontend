import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { KnobModule } from 'primeng/knob';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { MessageModule } from 'primeng/message';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';
import { calcularEstadoAvance } from '../../../core/models';
import { CaracterizaJson } from '../../../core/models/bitacora.model';

@Component({
  selector: 'app-secuencia-curso-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    FluidModule,
    InputNumberModule,
    TextareaModule,
    KnobModule,
    TagModule,
    ChartModule,
    MessageModule,
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

  // Datos cargados desde "Identificación de tu curso"
  numeroCreditos = signal<number | null>(null);
  horasDirectoCat  = signal<number | null>(null);
  horasIndependienteCat = signal<number | null>(null);
  caracterizaCargada = signal(false);

  /** Total de horas del curso (directo + independiente desde Identificación) */
  horasTotalesDisponibles = computed(() =>
    (this.horasDirectoCat() ?? 0) + (this.horasIndependienteCat() ?? 0)
  );

  /** True si hay horas disponibles para planear */
  datosHorasDisponibles = computed(() => this.horasTotalesDisponibles() > 0);

  // Horas calculadas desde la tabla
  horasAsignadas = 0;
  horasDisponibles = 0;
  porcentajeHorasAsignadas = 0;
  horasExcedidas = false;

  // Chart de referencia: directo vs independiente (valores de caracteriza)
  chartData: any;
  chartOptions: any;

  get secuenciaFormArray(): FormArray {
    return this.form.get('secuenciaCurso') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarDatosCaracteriza();
    this.inicializarChart();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private cargarDatosCaracteriza(): void {
    this.bitacoraService.obtenerSeccion('caracteriza').subscribe({
      next: (respuesta) => {
        const db = (respuesta?.datos as CaracterizaJson | undefined)?.datosBasicos;
        this.numeroCreditos.set(db?.numeroCreditos ?? null);
        this.horasDirectoCat.set(db?.horasDirecto ?? null);
        this.horasIndependienteCat.set(db?.horasIndependiente ?? null);
        this.caracterizaCargada.set(true);
        this.actualizarChart();
        this.recalcularHoras();
      },
      error: () => {
        this.caracterizaCargada.set(true);
      }
    });
  }

  protected initForm(): void {
    this.form = this.fb.group({
      secuenciaCurso: this.fb.array([])
    });
  }

  protected override setupProgressTracking(): void {
    this.form.valueChanges.subscribe(() => {
      this.recalcularHoras();
      this.calculateProgress();
    });
  }

  agregarFila(): void {
    this.secuenciaFormArray.push(this.crearFilaGroup({}));
    this.recalcularHoras();
    this.calculateProgress();
  }

  eliminarFila(index: number): void {
    this.secuenciaFormArray.removeAt(index);
    this.recalcularHoras();
    this.calculateProgress();
  }

  private crearFilaGroup(fila: any): FormGroup {
    return this.fb.group({
      // Backward-compat: 'modulo' → 'unidad', 'descripcion' → 'producto'
      unidad:           [fila.unidad           || fila.modulo      || ''],
      temas:            [fila.temas            || ''],
      actividadesAsync: [fila.actividadesAsync || ''],
      producto:         [fila.producto         || fila.descripcion || ''],
      evidencia:        [fila.evidencia        || ''],
      horas:            [fila.horas            || 0]
    });
  }

  protected override patchFormWithData(data: any): void {
    if (data?.secuenciaCurso && Array.isArray(data.secuenciaCurso)) {
      const fa = this.secuenciaFormArray;
      fa.clear();
      data.secuenciaCurso.forEach((fila: any) => fa.push(this.crearFilaGroup(fila)));
    }
    this.recalcularHoras();
  }

  protected override calculateProgress(): void {
    const filas = this.secuenciaFormArray.controls;
    const total = filas.length;
    const completas = filas.filter(fila => {
      const v = fila.value;
      return v.unidad?.trim() &&
             v.temas?.trim() &&
             v.actividadesAsync?.trim() &&
             v.producto?.trim() &&
             v.evidencia?.trim() &&
             (Number(v.horas) > 0);
    }).length;

    const percentage = total > 0 ? Math.round((completas / total) * 100) : 0;

    this._progress.set({
      sections: [{
        sectionName: 'secuencia',
        completedFields: completas,
        totalFields: total,
        percentage,
        estado: calcularEstadoAvance(percentage)
      }],
      totalPercentage: percentage,
      estado: calcularEstadoAvance(percentage)
    });
  }

  inicializarChart(): void {
    this.chartOptions = {
      cutout: '60%',
      plugins: { legend: { display: false } }
    };
    this.actualizarChart();
  }

  recalcularHoras(): void {
    const filas = this.secuenciaFormArray.value as any[];
    this.horasAsignadas = filas.reduce((sum, f) => sum + (Number(f.horas) || 0), 0);
    const total = this.horasTotalesDisponibles();
    this.horasDisponibles = Math.max(total - this.horasAsignadas, 0);
    this.porcentajeHorasAsignadas = total > 0
      ? Math.min(Math.round((this.horasAsignadas / total) * 100), 100)
      : 0;
    this.horasExcedidas = total > 0 && this.horasAsignadas > total;
  }

  actualizarChart(): void {
    const directo       = this.horasDirectoCat()      ?? 0;
    const independiente = this.horasIndependienteCat() ?? 0;
    this.chartData = {
      labels: ['Trabajo independiente', 'Acompañamiento directo'],
      datasets: [{
        data: [independiente, directo],
        backgroundColor: ['#22c55e', '#f97316'],
        hoverBackgroundColor: ['#16a34a', '#ea580c']
      }]
    };
  }
}
