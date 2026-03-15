import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

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

interface InstructionStep {
  icon: string;
  iconColor: string;
  text: string;
}

@Component({
  selector: 'app-actividades-aprendizaje-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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

  // Pasos de instrucción
  instructionSteps: InstructionStep[] = [
    { icon: 'pi pi-flag', iconColor: 'text-primary', text: 'Debes partir del (los) resultado(s) de aprendizaje de tu curso.' },
    { icon: 'pi pi-eye', iconColor: 'text-blue-500', text: 'Revisa las características generales de las actividades de aprendizaje según las dimensiones que viste en el aula virtual.' },
    { icon: 'pi pi-lightbulb', iconColor: 'text-yellow-500', text: 'Ten presente tu estilo de enseñanza: ¿Qué se te facilita más? o ¿Qué retos quieres asumir para acompañar a tus estudiantes?' },
    { icon: 'pi pi-bolt', iconColor: 'text-orange-500', text: 'Crea tu actividad de aprendizaje.' },
    { icon: 'pi pi-cog', iconColor: 'text-purple-500', text: '¿Qué metodologías de aprendizaje activo utilizarás?' },
    { icon: 'pi pi-send', iconColor: 'text-green-500', text: 'Sube tu actividad al foro del aula virtual en el formato establecido. Conoce y comenta las actividades de otros participantes.' },
  ];

  // Opciones de dimensión
  dimensionOptions = [
    { label: 'Compromiso o valoración', value: 'Compromiso o valoración' },
    { label: 'Dimensiones humanas del aprendizaje', value: 'Dimensiones humanas del aprendizaje' },
    { label: 'Conocimiento Fundamental', value: 'Conocimiento Fundamental' },
    { label: 'Aplicación del aprendizaje', value: 'Aplicación del aprendizaje' },
    { label: 'Integración', value: 'Integración' },
    { label: 'Aprender a aprender', value: 'Aprender a aprender' },
  ];

  // Opciones de metodología
  metodologias = [
    { label: 'Aprendizaje basado en proyectos', value: 'proyectos' },
    { label: 'Aprendizaje basado en juegos', value: 'juegos' },
    { label: 'Aprendizaje invertido', value: 'invertido' },
    { label: 'Aprendizaje basado en evidencia', value: 'evidencia' },
    { label: 'Diálogo reflexivo', value: 'dialogo' },
    { label: 'Aprendizaje cooperativo', value: 'cooperativo' },
    { label: 'Aprendizaje basado en problemas', value: 'problemas' },
    { label: 'Investigación - Acción', value: 'investigacion' },
    { label: 'Aprendizaje a través del servicio', value: 'servicio' },
    { label: 'Aprendizaje adaptativo', value: 'adaptativo' },
  ];

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

  override ngOnInit(): void {
    super.ngOnInit();
    this.loadFactoresData();
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
