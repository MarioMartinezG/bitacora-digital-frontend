import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

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
import { calcularEstadoAvance } from '../../../core/models';
import { ActividadItem } from '../../../core/models/bitacora.model';

@Component({
  selector: 'app-como-evaluare-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
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

  protected seccionCodigo = 'evaluacion';
  protected sectionsConfig: SectionConfig[] = [];

  // Actividades cargadas desde el módulo de Actividades de Aprendizaje
  actividadesList = signal<ActividadItem[]>([]);
  actividadesLoaded = signal(false);

  // Almacena los datos guardados de evaluación hasta que las actividades cargan
  private savedEvalData = new Map<string, any>();

  // Mapa para mostrar label legible de metodología
  readonly metodologiaLabels: Record<string, string> = {
    'proyectos': 'Aprendizaje basado en proyectos',
    'juegos': 'Aprendizaje basado en juegos',
    'invertido': 'Aprendizaje invertido',
    'evidencia': 'Aprendizaje basado en evidencia',
    'dialogo': 'Diálogo reflexivo',
    'cooperativo': 'Aprendizaje cooperativo',
    'problemas': 'Aprendizaje basado en problemas',
    'investigacion': 'Investigación - Acción',
    'servicio': 'Aprendizaje a través del servicio',
    'adaptativo': 'Aprendizaje adaptativo'
  };

  // Opciones de selects
  mediosOpciones = [
    {
      label: 'Escritos',
      items: [
        { label: 'Carpeta o dossier / carpeta colaborativa', value: 'carpeta_dossier' },
        { label: 'Control (Examen)', value: 'control_examen' },
        { label: 'Cuaderno / cuaderno de notas / cuaderno de campo', value: 'cuaderno' },
        { label: 'Cuestionario', value: 'cuestionario' },
        { label: 'Diario reflexivo / diario de clase', value: 'diario' },
        { label: 'Estudio de casos', value: 'estudio_casos' },
        { label: 'Ensayo', value: 'ensayo' },
        { label: 'Examen', value: 'examen' },
        { label: 'Foro virtual', value: 'foro_virtual' },
        { label: 'Memoria', value: 'memoria' },
        { label: 'Monografía', value: 'monografia' },
        { label: 'Informe', value: 'informe' },
        { label: 'Portafolio / portafolio electrónico', value: 'portafolio' },
        { label: 'Póster', value: 'poster' },
        { label: 'Proyecto', value: 'proyecto' },
        { label: 'Pruebas objetivas', value: 'pruebas_objetivas' },
        { label: 'Recensión', value: 'recension' },
        { label: 'Test diagnóstico', value: 'test_diagnostico' },
        { label: 'Trabajo escrito', value: 'trabajo_escrito' }
      ]
    },
    {
      label: 'Orales',
      items: [
        { label: 'Comunicación', value: 'comunicacion_oral' },
        { label: 'Cuestionario oral', value: 'cuestionario_oral' },
        { label: 'Debate / diálogo grupal', value: 'debate' },
        { label: 'Exposición', value: 'exposicion' },
        { label: 'Discusión grupal', value: 'discusion_grupal' },
        { label: 'Mesa redonda', value: 'mesa_redonda' },
        { label: 'Ponencia', value: 'ponencia' },
        { label: 'Pregunta de clase', value: 'pregunta_clase' },
        { label: 'Presentación oral', value: 'presentacion_oral' }
      ]
    },
    {
      label: 'Prácticos',
      items: [
        { label: 'Práctica supervisada', value: 'practica_supervisada' },
        { label: 'Demostración / actuación / representación', value: 'demostracion' },
        { label: 'Role playing', value: 'role_playing' }
      ]
    }
  ];

  tecnicasOpciones = [
    {
      label: 'El alumno no interviene',
      items: [
        { label: 'Análisis documental', value: 'analisis_documental' },
        { label: 'Análisis de producciones', value: 'analisis_producciones' },
        { label: 'Observación directa del alumno', value: 'observacion_directa' },
        { label: 'Observación del grupo', value: 'observacion_grupo' },
        { label: 'Observación sistemática', value: 'observacion_sistematica' },
        { label: 'Análisis de grabación de audio o video', value: 'analisis_audio_video' }
      ]
    },
    {
      label: 'El alumno participa',
      items: [
        { label: 'Autoevaluación (autorreflexión y/o análisis documental)', value: 'autoevaluacion' },
        { label: 'Evaluación entre pares (análisis documental y/o observación)', value: 'coevaluacion' },
        { label: 'Evaluación compartida o colaborativa (entrevista individual o grupal)', value: 'evaluacion_colaborativa' }
      ]
    }
  ];

  instrumentosOpciones = [
    { label: 'Diario del profesor', value: 'diario_profesor' },
    { label: 'Escala de comprobación', value: 'escala_comprobacion' },
    { label: 'Escala de diferencial semántico', value: 'escala_diferencial' },
    { label: 'Escala verbal o numérica', value: 'escala_verbal_numerica' },
    { label: 'Escala descriptiva o rúbrica', value: 'escala_rubrica' },
    { label: 'Escala de estimación', value: 'escala_estimacion' },
    { label: 'Ficha de observación', value: 'ficha_observacion' },
    { label: 'Lista de control', value: 'lista_control' },
    { label: 'Matrices de decisión', value: 'matrices_decision' },
    { label: 'Fichas de seguimiento individual o grupal', value: 'fichas_seguimiento' },
    { label: 'Fichas de autoevaluación', value: 'fichas_autoevaluacion' },
    { label: 'Fichas de evaluación entre iguales', value: 'fichas_entre_iguales' },
    { label: 'Informe de expertos', value: 'informe_expertos' },
    { label: 'Informe de autoevaluación', value: 'informe_autoevaluacion' }
  ];

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
