import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';

// Models
import { calcularEstadoAvance } from '../../../core/models';
import { DimensionService } from '../../../core/services/dimension.service';
import { MetodologiaService } from '../../../core/services/metodologia.service';

// Validation
import { ValidationService, ValidationResponse } from '../../../core/services/validation.service';

interface InstructionStep {
  icon: string;
  iconColor: string;
  text: string;
}

interface ValidationState {
  loading: boolean;
  result: ValidationResponse | null;
  error: string | null;
}

@Component({
  selector: 'app-actividades-aprendizaje-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    ButtonModule,
    FluidModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    TagModule,
    MessageModule,
    FieldsetModule,
    TooltipModule,
    DividerModule,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    BitacoraCommentButtonComponent,
    ExportButtonComponent
  ],
  templateUrl: './actividades-aprendizaje-component.html',
  styleUrl: './actividades-aprendizaje-component.css'
})
export class ActividadesAprendizajeComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private validationService = inject(ValidationService);
  private dimensionService = inject(DimensionService);
  private metodologiaService = inject(MetodologiaService);

  protected seccionCodigo = 'actividades';
  protected sectionsConfig: SectionConfig[] = [];

  // Datos de referencia cargados desde Factores Situacionales
  raList = signal<string[]>([]);
  topics = signal<{ id: number; name: string }[]>([]);
  subtopics = signal<{ id: number; topicId: number; name: string }[]>([]);
  factoresLoaded = signal(false);

  hasRA = computed(() => this.raList().length > 0);
  hasTopics = computed(() => this.topics().length > 0);
  hasFactoresData = computed(() => this.hasRA() || this.hasTopics());
  topicsWithoutSubtopics = computed(() =>
    this.topics().filter(t => !this.subtopics().some(st => st.topicId === t.id))
  );

  // Estado de validación por actividad (índice → estado)
  actividadValidation = signal<Partial<Record<number, ValidationState>>>({});

  // Pasos de instrucción
  instructionSteps: InstructionStep[] = [
    { icon: 'pi pi-flag', iconColor: 'text-primary', text: 'Debes partir del (los) resultado(s) de aprendizaje de tu curso.' },
    { icon: 'pi pi-eye', iconColor: 'text-blue-500', text: 'Revisa las características generales de las actividades de aprendizaje según las dimensiones que viste en el aula virtual.' },
    { icon: 'pi pi-lightbulb', iconColor: 'text-yellow-500', text: 'Ten presente tu estilo de enseñanza: ¿Qué se te facilita más? o ¿Qué retos quieres asumir para acompañar a tus estudiantes?' },
    { icon: 'pi pi-bolt', iconColor: 'text-orange-500', text: 'Crea tu actividad de aprendizaje.' },
    { icon: 'pi pi-cog', iconColor: 'text-purple-500', text: '¿Qué metodologías de aprendizaje activo utilizarás?' },
    { icon: 'pi pi-send', iconColor: 'text-green-500', text: 'Sube tu actividad al foro del aula virtual en el formato establecido. Conoce y comenta las actividades de otros participantes.' },
  ];

  // Opciones de dimensión — cargadas desde API
  dimensionOptions: { label: string; value: string }[] = [];

  // Opciones de metodología — cargadas desde API
  metodologias: { label: string; value: string }[] = [];

  get actividadesArray(): FormArray {
    return this.form.get('actividades') as FormArray;
  }

  getSubtopicOptions(topicName: string): { label: string; value: string }[] {
    if (!topicName) return [];
    const topic = this.topics().find(t => t.name === topicName);
    if (!topic) return [];
    return this.subtopics()
      .filter(st => st.topicId === topic.id)
      .map(st => ({ label: st.name, value: st.name }));
  }

  hasSubtopicsForTema(topicName: string): boolean {
    return this.getSubtopicOptions(topicName).length > 0;
  }

  topicHasSubtopics(topicName: string): boolean {
    return this.hasSubtopicsForTema(topicName);
  }

  topicIsIncomplete(topicName: string): boolean {
    return this.topicsWithoutSubtopics().some(t => t.name === topicName);
  }

  setFieldValue(actividadIndex: number, field: string, value: any): void {
    const group = this.actividadesArray.at(actividadIndex) as FormGroup;
    group.get(field)?.setValue(value);
    if (field === 'tema') {
      group.get('subtema')?.setValue('');
    }
  }

  getMetodologiaLabel(value: string | null | undefined): string {
    const found = this.metodologias.find(m => m.value === value);
    return found ? found.label : (value || '');
  }

  getVerdictSeverity(verdict: string): 'success' | 'warn' | 'danger' | 'secondary' {
    if (verdict === 'COHERENTE') return 'success';
    if (verdict === 'PARCIALMENTE COHERENTE') return 'warn';
    if (verdict === 'NO COHERENTE') return 'danger';
    return 'secondary';
  }

  validateActividad(index: number): void {
    const group = this.actividadesArray.at(index) as FormGroup;
    const val = group.value;

    this.actividadValidation.update(s => ({
      ...s,
      [index]: { loading: true, result: null, error: null }
    }));

    this.validationService.validateActivity({
      resultado_aprendizaje: val.ra,
      dimension: val.dimension,
      metodologia: this.getMetodologiaLabel(val.metodologia),
      descripcion: val.descripcion
    }).subscribe({
      next: (result) => {
        this.actividadValidation.update(s => ({
          ...s,
          [index]: { loading: false, result, error: null }
        }));
      },
      error: () => {
        this.actividadValidation.update(s => ({
          ...s,
          [index]: { loading: false, result: null, error: 'No se pudo conectar con el servicio de validación. Intenta de nuevo.' }
        }));
      }
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadFactoresData();
    this.dimensionService.obtenerDimensiones().subscribe({
      next: (items) => { this.dimensionOptions = items.map(d => ({ label: d.nombre, value: d.nombre })); },
      error: () => {}
    });
    this.metodologiaService.obtenerMetodologias().subscribe({
      next: (items) => { this.metodologias = items.map(m => ({ label: m.label, value: m.value })); },
      error: () => {}
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private loadFactoresData(): void {
    this.bitacoraService.obtenerSeccion('factores').subscribe({
      next: (respuesta) => {
        if (respuesta?.datos) {
          const data = respuesta.datos;
          this.raList.set(data['resultadosAprendizaje'] || []);
          this.topics.set(data['contenidos']?.topics || []);
          this.subtopics.set(data['contenidos']?.subtopics || []);
        }
        this.factoresLoaded.set(true);
      },
      error: () => {
        this.factoresLoaded.set(true);
      }
    });
  }

  protected initForm(): void {
    this.form = this.fb.group({
      actividades: this.fb.array([])
    });
  }

  protected override patchFormWithData(data: any): void {
    if (data?.actividades && Array.isArray(data.actividades)) {
      const arr = this.actividadesArray;
      arr.clear({ emitEvent: false });
      data.actividades.forEach((a: any, idx: number) => {
        arr.push(this.fb.group({
          nombre: [a.nombre || `Actividad ${idx + 1}`],
          ra: [a.ra || ''],
          tema: [a.tema || ''],
          subtema: [a.subtema || ''],
          dimension: [a.dimension || null],
          metodologia: [a.metodologia || null],
          descripcion: [a.descripcion || '']
        }), { emitEvent: false });
      });
    }
  }

  addActividad(): void {
    const nombre = `Actividad ${this.actividadesArray.length + 1}`;
    this.actividadesArray.push(this.fb.group({
      nombre: [nombre],
      ra: [''],
      tema: [''],
      subtema: [''],
      dimension: [null],
      metodologia: [null],
      descripcion: ['']
    }));
  }

  removeActividad(index: number): void {
    this.actividadesArray.removeAt(index);
    // Limpiar estado de validación del índice eliminado
    this.actividadValidation.update(s => {
      const updated: Partial<Record<number, ValidationState>> = {};
      Object.keys(s).forEach(k => {
        const i = Number(k);
        if (i < index) updated[i] = s[i];
        else if (i > index) updated[i - 1] = s[i];
      });
      return updated;
    });
  }

  protected override calculateProgress(): void {
    const count = this.actividadesArray.length;
    if (count === 0) {
      this._progress.set({ sections: [], totalPercentage: 0, estado: 'sin_avances' });
      return;
    }

    let totalCompleted = 0;
    const totalFields = count * 5; // ra, tema, dimension, metodologia, descripcion
    for (let i = 0; i < count; i++) {
      const g = this.actividadesArray.at(i) as FormGroup;
      ['ra', 'tema', 'dimension', 'metodologia', 'descripcion'].forEach(field => {
        const val = g.get(field)?.value;
        if (val !== null && val !== undefined && val !== '') totalCompleted++;
      });
    }

    const totalPercentage = Math.round((totalCompleted / totalFields) * 100);
    this._progress.set({
      sections: [{
        sectionName: 'actividades',
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
