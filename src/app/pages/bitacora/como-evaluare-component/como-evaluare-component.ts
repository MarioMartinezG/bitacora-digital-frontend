import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FieldsetModule } from 'primeng/fieldset';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';

// Models
import { calcularEstadoAvance, MedioGrupo, TecnicaGrupo, InstrumentoDTO } from '../../../core/models';
import { ActividadItem } from '../../../core/models/bitacora.model';
import { MedioService } from '../../../core/services/medio.service';
import { TecnicaService } from '../../../core/services/tecnica.service';
import { InstrumentoService } from '../../../core/services/instrumento.service';
import { MetodologiaService } from '../../../core/services/metodologia.service';

// Validation
import { ValidationService, ValidationResponse } from '../../../core/services/validation.service';

interface ValidationState {
  loading: boolean;
  result: ValidationResponse | null;
  error: string | null;
}

@Component({
  selector: 'app-como-evaluare-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    ButtonModule,
    FluidModule,
    TagModule,
    MessageModule,
    FieldsetModule,
    DividerModule,
    TooltipModule,
    MultiSelectModule,
    SelectModule,
    TextareaModule,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    BitacoraCommentButtonComponent,
    ExportButtonComponent
  ],
  templateUrl: './como-evaluare-component.html',
  styleUrl: './como-evaluare-component.css'
})
export class ComoEvaluareComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);
  private medioService = inject(MedioService);
  private tecnicaService = inject(TecnicaService);
  private instrumentoService = inject(InstrumentoService);
  private metodologiaService = inject(MetodologiaService);

  protected seccionCodigo = 'evaluacion';
  protected sectionsConfig: SectionConfig[] = [];

  // Actividades cargadas desde el módulo de Actividades de Aprendizaje
  actividadesList = signal<ActividadItem[]>([]);
  actividadesLoaded = signal(false);

  // Estado de validación por evaluación (índice → estado)
  evaluacionValidation = signal<Partial<Record<number, ValidationState>>>({});

  // Almacena los datos guardados de evaluación hasta que las actividades cargan
  private savedEvalData = new Map<string, any>();

  // Mapa para mostrar label legible de metodología — cargado dinámicamente desde API
  metodologiaLabels: Record<string, string> = {};

  // Opciones de medios — cargadas desde API
  mediosOpciones: MedioGrupo[] = [];

  // Opciones de técnicas — cargadas desde API
  tecnicasOpciones: TecnicaGrupo[] = [];

  // Opciones de instrumentos — cargadas desde API
  instrumentosOpciones: { label: string; value: string }[] = [];

  tipoEvaluacionOpciones = [
    { label: 'Sumativa', value: 'sumativa' },
    { label: 'Formativa', value: 'formativa' },
    { label: 'Mixta', value: 'mixta' }
  ];

  actoresOpciones = [
    { label: 'Heteroevaluación', value: 'hetero' },
    { label: 'Coevaluación', value: 'co' },
    { label: 'Autoevaluación', value: 'auto' }
  ];

  momentosOpciones = [
    { label: 'Inicial', value: 'inicial' },
    { label: 'Media procesual', value: 'media' },
    { label: 'Final', value: 'final' }
  ];

  get actividadesEvalArray(): FormArray {
    return this.form.get('actividadesEvaluacion') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadActividades();
    this.metodologiaService.obtenerMetodologias().subscribe({
      next: (items) => {
        this.metodologiaLabels = Object.fromEntries(items.map(m => [m.value, m.label]));
      },
      error: () => {}
    });
    this.medioService.obtenerMediosAgrupados().subscribe({
      next: (grupos) => { this.mediosOpciones = grupos; },
      error: () => {}
    });
    this.tecnicaService.obtenerTecnicasAgrupadas().subscribe({
      next: (grupos) => { this.tecnicasOpciones = grupos; },
      error: () => {}
    });
    this.instrumentoService.obtenerInstrumentos().subscribe({
      next: (items) => { this.instrumentosOpciones = items.map(i => ({ label: i.label, value: i.value })); },
      error: () => {}
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private loadActividades(): void {
    this.bitacoraService.obtenerSeccion('actividades').subscribe({
      next: (respuesta) => {
        const actividades: ActividadItem[] = respuesta?.datos?.['actividades'] || [];
        this.actividadesList.set(actividades);
        this.buildActividadesFormArray(actividades);
        this.actividadesLoaded.set(true);
      },
      error: () => {
        this.actividadesLoaded.set(true);
      }
    });
  }

  private buildActividadesFormArray(actividades: ActividadItem[]): void {
    const arr = this.actividadesEvalArray;
    arr.clear({ emitEvent: false });
    actividades.forEach(act => {
      const saved = this.savedEvalData.get(act.nombre || '');
      arr.push(this.createEvaluacionGroup(act.nombre || '', saved), { emitEvent: false });
    });

    this.cleanStaleEvalEntries();
  }

  private createEvaluacionGroup(nombre: string, saved?: any): FormGroup {
    return this.fb.group({
      nombre: [nombre],
      descripcionEvaluacion: [saved?.descripcionEvaluacion || ''],
      tipoEvaluacion: [saved?.tipoEvaluacion || null],
      momento: [saved?.momento || null],
      actores: [saved?.actores || null],
      medios: [saved?.medios || []],
      tecnicas: [saved?.tecnicas || []],
      instrumentos: [saved?.instrumentos || []]
    });
  }

  protected initForm(): void {
    this.form = this.fb.group({
      actividadesEvaluacion: this.fb.array([])
    });
  }

  protected override patchFormWithData(data: any): void {
    // Guardar datos de eval por nombre para cuando carguen las actividades
    this.savedEvalData.clear();
    (data?.actividadesEvaluacion || []).forEach((entry: any) => {
      if (entry.nombre) this.savedEvalData.set(entry.nombre, entry);
    });

    // Si las actividades ya cargaron, aplicar y verificar datos obsoletos
    if (this.actividadesLoaded()) {
      this.patchEvalFields();
      this.cleanStaleEvalEntries();
    }
  }

  /** Fuerza un guardado si el backend tiene entradas de actividades que ya no existen */
  private cleanStaleEvalEntries(): void {
    const currentNames = new Set(this.actividadesList().map(a => a.nombre || ''));
    const hasStaleEntries = [...this.savedEvalData.keys()].some(k => k && !currentNames.has(k));
    if (hasStaleEntries) {
      this.saveManually();
    }
  }

  private patchEvalFields(): void {
    this.actividadesEvalArray.controls.forEach(ctrl => {
      const g = ctrl as FormGroup;
      const nombre = g.get('nombre')?.value;
      const saved = nombre ? this.savedEvalData.get(nombre) : null;
      if (!saved) return;
      g.patchValue({
        descripcionEvaluacion: saved.descripcionEvaluacion || '',
        tipoEvaluacion: saved.tipoEvaluacion || null,
        momento: saved.momento || null,
        actores: saved.actores || null,
        medios: saved.medios || [],
        tecnicas: saved.tecnicas || [],
        instrumentos: saved.instrumentos || []
      }, { emitEvent: false });
    });
  }

  getMetodologiaLabel(value: string | undefined | null): string {
    return value ? (this.metodologiaLabels[value] || value) : '';
  }

  getVerdictSeverity(verdict: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (verdict === 'COHERENTE') return 'success';
    if (verdict === 'PARCIALMENTE COHERENTE') return 'warn';
    if (verdict === 'NO COHERENTE') return 'danger';
    return 'secondary';
  }

  validateEvaluacion(index: number): void {
    const evalGroup = this.actividadesEvalArray.at(index) as FormGroup;
    const evalVal = evalGroup.value;
    const act = this.actividadesList()[index];

    this.evaluacionValidation.update(s => ({
      ...s,
      [index]: { loading: true, result: null, error: null }
    }));

    this.validationService.validateEvaluation({
      resultado_aprendizaje: act?.ra || '',
      nombre_actividad: act?.nombre || evalVal.nombre || '',
      descripcion_evaluacion: evalVal.descripcionEvaluacion,
      tipo: evalVal.tipoEvaluacion,
      momento: evalVal.momento,
      actores: evalVal.actores,
      medios: evalVal.medios || [],
      tecnicas: evalVal.tecnicas || [],
      instrumentos: evalVal.instrumentos || []
    }).subscribe({
      next: (result) => {
        this.evaluacionValidation.update(s => ({
          ...s,
          [index]: { loading: false, result, error: null }
        }));
      },
      error: () => {
        this.evaluacionValidation.update(s => ({
          ...s,
          [index]: { loading: false, result: null, error: 'No se pudo conectar con el servicio de validación. Intenta de nuevo.' }
        }));
      }
    });
  }

  protected override calculateProgress(): void {
    const count = this.actividadesEvalArray.length;
    let totalFields = 0;
    let totalCompleted = 0;

    for (let i = 0; i < count; i++) {
      const g = this.actividadesEvalArray.at(i) as FormGroup;
      const simpleFields = ['descripcionEvaluacion', 'tipoEvaluacion', 'momento', 'actores'];
      const arrayFields = ['medios', 'tecnicas', 'instrumentos'];
      totalFields += simpleFields.length + arrayFields.length;
      simpleFields.forEach(f => {
        const val = g.get(f)?.value;
        if (val !== null && val !== undefined && val !== '') totalCompleted++;
      });
      arrayFields.forEach(f => {
        const val = g.get(f)?.value;
        if (Array.isArray(val) && val.length > 0) totalCompleted++;
      });
    }

    const totalPercentage = totalFields > 0 ? Math.round((totalCompleted / totalFields) * 100) : 0;
    this._progress.set({
      sections: [{
        sectionName: 'evaluacion',
        completedFields: totalCompleted,
        totalFields,
        percentage: totalPercentage,
        estado: calcularEstadoAvance(totalPercentage)
      }],
      totalPercentage,
      estado: calcularEstadoAvance(totalPercentage)
    });
  }
}
