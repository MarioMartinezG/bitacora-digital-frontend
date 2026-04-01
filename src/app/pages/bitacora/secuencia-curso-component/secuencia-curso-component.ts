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
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button';

// Modelos
import { Topic } from '../../../core/models/topic.model';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';
import { calcularEstadoAvance } from '../../../core/models';
import { CaracterizaJson } from '../../../core/models/bitacora.model';

/** Opción del multiselect de temas */
interface TemaItem { label: string; value: string; }

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
    SelectModule,
    MultiSelectModule,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    BitacoraCommentButtonComponent,
    ExportButtonComponent
  ],
  templateUrl: './secuencia-curso-component.html',
  styleUrl: './secuencia-curso-component.css'
})
export class SecuenciaCursoComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  protected seccionCodigo = 'secuencia';
  protected sectionsConfig: SectionConfig[] = [];

  // Opciones de tipo de actividad
  readonly tipoOptions = [
    { label: 'Sincrónica',  value: 'sincrona'  },
    { label: 'Asincrónica', value: 'asincrona' }
  ];

  // Temas cargados desde Factores situacionales
  temasDisponibles = signal<TemaItem[]>([]);
  temasEncontrados = signal(false);

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

  // Horas calculadas desde la tabla — totales
  horasAsignadas = 0;
  horasDisponibles = 0;
  porcentajeHorasAsignadas = 0;
  horasExcedidas = false;

  // Horas por tipo: sincrónicas (acompañamiento directo)
  horasAsignadasSync  = 0;
  horasDisponiblesSync = 0;
  porcentajeHorasSync = 0;
  horasExcedidasSync  = false;

  // Horas por tipo: asincrónicas (trabajo independiente)
  horasAsignadasAsync  = 0;
  horasDisponiblesAsync = 0;
  porcentajeHorasAsync = 0;
  horasExcedidasAsync  = false;

  // Chart de referencia: directo vs independiente (valores de caracteriza)
  chartData: any;
  chartOptions: any;

  get secuenciaFormArray(): FormArray {
    return this.form.get('secuenciaCurso') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarDatosCaracteriza();
    this.cargarDatosFactores();
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
        this.calculateProgress();
      },
      error: () => {
        this.caracterizaCargada.set(true);
      }
    });
  }

  private cargarDatosFactores(): void {
    this.bitacoraService.obtenerSeccion('factores').subscribe({
      next: (respuesta) => {
        const contenidos = (respuesta?.datos as any)?.contenidos;
        const topics: Topic[] = contenidos?.topics || [];

        const opciones: TemaItem[] = topics.map(t => ({ label: t.name, value: t.name }));

        this.temasDisponibles.set(opciones);
        this.temasEncontrados.set(topics.length > 0);
      },
      error: () => {
        this.temasEncontrados.set(false);
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
    // temas: ahora es string[] (multiselect). Backward-compat: si era string lo descartamos
    const temasValue = Array.isArray(fila.temas) ? fila.temas : [];
    return this.fb.group({
      // Backward-compat: 'modulo' → 'unidad', 'descripcion' → 'producto'
      unidad:          [fila.unidad           || fila.modulo      || ''],
      temas:           [temasValue],
      // Backward-compat: filas antiguas sin tipo se consideran asincrónicas
      tipoActividad:   [fila.tipoActividad    || 'asincrona'],
      actividadesAsync:[fila.actividadesAsync || ''],
      producto:        [fila.producto         || fila.descripcion || ''],
      evidencia:       [fila.evidencia        || ''],
      horas:           [fila.horas            || 0]
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
    const directo       = this.horasDirectoCat()      ?? 0;
    const independiente = this.horasIndependienteCat() ?? 0;

    // Sin datos de horas en Identificación: progreso 0
    if (directo === 0 && independiente === 0) {
      this._progress.set({
        sections: [{ sectionName: 'secuencia', completedFields: 0, totalFields: 1, percentage: 0, estado: calcularEstadoAvance(0) }],
        totalPercentage: 0,
        estado: calcularEstadoAvance(0)
      });
      return;
    }

    // % de cada tipo, ya calculados y capados a 100 en recalcularHoras()
    const pSync  = directo       > 0 ? this.porcentajeHorasSync  : null;
    const pAsync = independiente > 0 ? this.porcentajeHorasAsync : null;

    // Promedio solo de los tipos que tienen horas definidas
    const partes = [pSync, pAsync].filter((p): p is number => p !== null);
    const raw = Math.round(partes.reduce((s, p) => s + p, 0) / partes.length);

    // Si hay horas excedidas la sección nunca se marca como completada
    const percentage = this.horasExcedidas ? Math.min(raw, 99) : Math.min(raw, 100);

    this._progress.set({
      sections: [{
        sectionName: 'secuencia',
        completedFields: percentage,
        totalFields: 100,
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

    // Separar por tipo
    this.horasAsignadasSync  = filas
      .filter(f => f.tipoActividad === 'sincrona')
      .reduce((sum, f) => sum + (Number(f.horas) || 0), 0);

    this.horasAsignadasAsync = filas
      .filter(f => f.tipoActividad !== 'sincrona')
      .reduce((sum, f) => sum + (Number(f.horas) || 0), 0);

    this.horasAsignadas = this.horasAsignadasSync + this.horasAsignadasAsync;

    const directo       = this.horasDirectoCat()      ?? 0;
    const independiente = this.horasIndependienteCat() ?? 0;
    const total         = this.horasTotalesDisponibles();

    // Disponibles por tipo (mínimo 0, nunca negativo)
    this.horasDisponiblesSync  = Math.max(directo       - this.horasAsignadasSync,  0);
    this.horasDisponiblesAsync = Math.max(independiente - this.horasAsignadasAsync, 0);
    this.horasDisponibles      = Math.max(total         - this.horasAsignadas,      0);

    // Excedidos
    this.horasExcedidasSync  = directo       > 0 && this.horasAsignadasSync  > directo;
    this.horasExcedidasAsync = independiente > 0 && this.horasAsignadasAsync > independiente;
    this.horasExcedidas      = this.horasExcedidasSync || this.horasExcedidasAsync;

    // Porcentajes
    this.porcentajeHorasAsignadas = total > 0
      ? Math.min(Math.round((this.horasAsignadas / total) * 100), 100)
      : 0;
    this.porcentajeHorasSync = directo > 0
      ? Math.min(Math.round((this.horasAsignadasSync / directo) * 100), 100)
      : 0;
    this.porcentajeHorasAsync = independiente > 0
      ? Math.min(Math.round((this.horasAsignadasAsync / independiente) * 100), 100)
      : 0;
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
