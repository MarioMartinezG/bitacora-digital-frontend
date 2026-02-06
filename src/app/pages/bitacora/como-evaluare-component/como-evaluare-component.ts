import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { RadioButtonModule } from 'primeng/radiobutton';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { DimensionEvaluacionWidget } from './components/dimension-evaluacion/dimension-evaluacion.widget';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';

// Models
import { calcularEstadoAvance, EstadoAvance } from '../../../core/models';

interface DimensionMeta {
  nombre: string;
  resultado: string;
  icono: string;
  iconoColor: string;
}

interface ChecklistPregunta {
  texto: string;
}

interface ChecklistGrupo {
  titulo: string;
  preguntas: ChecklistPregunta[];
}

@Component({
  selector: 'app-como-evaluare-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    FluidModule,
    AccordionModule,
    TagModule,
    RadioButtonModule,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    DimensionEvaluacionWidget
  ],
  templateUrl: './como-evaluare-component.html',
  styleUrl: './como-evaluare-component.css'
})
export class ComoEvaluareComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  protected seccionCodigo = 'evaluacion';

  // Override personalizado de calculateProgress
  protected sectionsConfig: SectionConfig[] = [];

  // Metadatos de display para las 6 dimensiones
  dimensionMeta: DimensionMeta[] = [
    {
      nombre: 'Compromiso o valoración',
      resultado: 'Desarrolla la capacidad de reconocer el valor del aprendizaje.',
      icono: 'pi-bolt',
      iconoColor: 'text-primary'
    },
    {
      nombre: 'Dimensiones humanas del aprendizaje',
      resultado: 'Reconoce la importancia del trabajo colaborativo y la empatía.',
      icono: 'pi-users',
      iconoColor: 'text-green-500'
    },
    {
      nombre: 'Conocimiento Fundamental',
      resultado: 'Comprende los fundamentos teóricos del curso.',
      icono: 'pi-book',
      iconoColor: 'text-orange-500'
    },
    {
      nombre: 'Aplicación del aprendizaje',
      resultado: 'Aplica los conocimientos adquiridos a contextos reales.',
      icono: 'pi-cog',
      iconoColor: 'text-cyan-600'
    },
    {
      nombre: 'Integración',
      resultado: 'Integra los saberes del curso con otras áreas del conocimiento.',
      icono: 'pi-link',
      iconoColor: 'text-indigo-500'
    },
    {
      nombre: 'Aprender a aprender',
      resultado: 'Desarrolla autonomía en su proceso de aprendizaje.',
      icono: 'pi-compass',
      iconoColor: 'text-purple-500'
    }
  ];

  // Configuración estática del checklist
  checklistConfig: ChecklistGrupo[] = [
    {
      titulo: 'Definición de los criterios de evaluación',
      preguntas: [
        { texto: '¿Son observables y medibles?' },
        { texto: '¿Son pertinentes?' },
        { texto: '¿Tengo un plan de socialización con mis estudiantes?' }
      ]
    },
    {
      titulo: 'Selección de los instrumentos de evaluación',
      preguntas: [
        { texto: '¿Están alineados con el resultado y la dimensión del aprendizaje?' },
        { texto: '¿Son variados y consideran los estilos de aprendizaje?' },
        { texto: '¿Establecen niveles de desempeño claros para los estudiantes?' }
      ]
    },
    {
      titulo: 'Participantes',
      preguntas: [
        { texto: '¿Existen actividades de auto, hetero y coevaluación con instrumentos específicos?' }
      ]
    },
    {
      titulo: 'Diálogo para la retroalimentación',
      preguntas: [
        { texto: '¿He planeado y socializado los momentos de retroalimentación?' },
        { texto: '¿Se combinan la evaluación formativa con la sumativa?' }
      ]
    },
    {
      titulo: 'Calificación final (Numérica)',
      preguntas: [
        { texto: '¿Refleja el alcance de los resultados de aprendizaje?' },
        { texto: '¿Corresponde a la escala institucional?' },
        { texto: '¿Es flexible y contempla diferentes métodos de calificación?' }
      ]
    }
  ];

  // Escalas de criterios según programa
  criteriosPregrado = [
    { valor: 5.0, etiqueta: 'Logro de resultados de aprendizaje excelente' },
    { valor: 4.0, etiqueta: 'Logro de resultados de aprendizaje bueno' },
    { valor: 3.0, etiqueta: 'Logro de resultados de aprendizaje mínimo aceptable' },
    { valor: 2.0, etiqueta: 'Logro de resultados de aprendizaje bajo' },
    { valor: 1.0, etiqueta: 'Logro de resultados de aprendizaje excesivamente bajo' },
    { valor: 0.0, etiqueta: 'Logro de resultados de aprendizaje nulo' }
  ];

  criteriosPosgrado = [
    { valor: 5.0, etiqueta: 'Logro de resultados de aprendizaje excelente' },
    { valor: 4.0, etiqueta: 'Logro de resultados de aprendizaje bueno' },
    { valor: 3.5, etiqueta: 'Logro de resultados de aprendizaje mínimo aceptable' },
    { valor: 3.0, etiqueta: 'Logro de resultados de aprendizaje bajo' },
    { valor: 2.0, etiqueta: 'Logro de resultados de aprendizaje bajo' },
    { valor: 1.0, etiqueta: 'Logro de resultados de aprendizaje excesivamente bajo' },
    { valor: 0.0, etiqueta: 'Logro de resultados de aprendizaje nulo' }
  ];

  // Getters
  get dimensionesFormArray(): FormArray {
    return this.form.get('dimensiones') as FormArray;
  }

  get dimensionFormGroups(): FormGroup[] {
    return this.dimensionesFormArray.controls as FormGroup[];
  }

  get checklistFormArray(): FormArray {
    return this.form.get('checklist') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.setupProgramaListener();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      programaSeleccionado: [null],
      dimensiones: this.fb.array(
        this.dimensionMeta.map(dim => this.createDimensionGroup(dim))
      ),
      checklist: this.fb.array(
        this.checklistConfig.map(grupo =>
          this.fb.array(grupo.preguntas.map(() => this.fb.control(null)))
        )
      )
    });
  }

  private createDimensionGroup(dim: DimensionMeta): FormGroup {
    return this.fb.group({
      dimensionNombre: [dim.nombre],
      resultadoAprendizaje: [dim.resultado],
      medios: [[]],
      otroMedio: [false],
      otroMedioTexto: [''],
      tecnicas: [[]],
      otraTecnica: [false],
      otraTecnicaTexto: [''],
      instrumentos: [[]],
      otroInstrumento: [false],
      otroInstrumentoTexto: [''],
      tipoEvaluacion: [null],
      otroTipoEvaluacion: [false],
      otroTipoEvaluacionTexto: [''],
      participantes: [null],
      otrosParticipantes: [false],
      otrosParticipantesTexto: [''],
      momento: [null],
      criteriosEvaluacion: this.fb.array([])
    });
  }

  private setupProgramaListener(): void {
    this.form.get('programaSeleccionado')?.valueChanges.subscribe(value => {
      this.rebuildCriteriosEvaluacion(value);
    });
  }

  private rebuildCriteriosEvaluacion(programa: 'pregrado' | 'posgrado' | null): void {
    const base = programa === 'posgrado' ? this.criteriosPosgrado
               : programa === 'pregrado' ? this.criteriosPregrado
               : [];

    this.dimensionesFormArray.controls.forEach(dimControl => {
      const dimGroup = dimControl as FormGroup;
      const criteriosArray = dimGroup.get('criteriosEvaluacion') as FormArray;

      // Preservar descripciones existentes por índice
      const existingDescriptions: string[] = [];
      criteriosArray.controls.forEach(c => {
        existingDescriptions.push((c as FormGroup).get('descripcion')?.value || '');
      });

      criteriosArray.clear();
      base.forEach((c, i) => {
        criteriosArray.push(this.fb.group({
          valor: [c.valor],
          etiqueta: [c.etiqueta],
          descripcion: [existingDescriptions[i] || '']
        }));
      });
    });
  }

  // Métodos para el template
  seleccionarPrograma(tipo: 'pregrado' | 'posgrado'): void {
    this.form.get('programaSeleccionado')?.setValue(tipo);
  }

  esProgramaSeleccionado(tipo: string): boolean {
    return this.form.get('programaSeleccionado')?.value === tipo;
  }

  getChecklistGrupoArray(index: number): FormArray {
    return this.checklistFormArray.at(index) as FormArray;
  }

  /**
   * Override patchFormWithData para manejar FormArrays complejos
   */
  protected override patchFormWithData(data: any): void {
    // 1. Programa (dispara rebuild de criteriosEvaluacion)
    if (data?.programaSeleccionado) {
      this.form.get('programaSeleccionado')?.setValue(data.programaSeleccionado);
    }

    // 2. Dimensiones
    if (data?.dimensiones && Array.isArray(data.dimensiones)) {
      data.dimensiones.forEach((dimData: any, index: number) => {
        if (index < this.dimensionesFormArray.length) {
          const dimGroup = this.dimensionesFormArray.at(index) as FormGroup;

          // Patch campos simples
          dimGroup.patchValue({
            medios: dimData.medios || [],
            otroMedio: dimData.otroMedio || false,
            otroMedioTexto: dimData.otroMedioTexto || '',
            tecnicas: dimData.tecnicas || [],
            otraTecnica: dimData.otraTecnica || false,
            otraTecnicaTexto: dimData.otraTecnicaTexto || '',
            instrumentos: dimData.instrumentos || [],
            otroInstrumento: dimData.otroInstrumento || false,
            otroInstrumentoTexto: dimData.otroInstrumentoTexto || '',
            tipoEvaluacion: dimData.tipoEvaluacion || null,
            otroTipoEvaluacion: dimData.otroTipoEvaluacion || false,
            otroTipoEvaluacionTexto: dimData.otroTipoEvaluacionTexto || '',
            participantes: dimData.participantes || null,
            otrosParticipantes: dimData.otrosParticipantes || false,
            otrosParticipantesTexto: dimData.otrosParticipantesTexto || '',
            momento: dimData.momento || null
          }, { emitEvent: false });

          // Patch criteriosEvaluacion descripciones
          if (dimData.criteriosEvaluacion && Array.isArray(dimData.criteriosEvaluacion)) {
            const criteriosArray = dimGroup.get('criteriosEvaluacion') as FormArray;
            dimData.criteriosEvaluacion.forEach((c: any, j: number) => {
              if (j < criteriosArray.length) {
                criteriosArray.at(j).patchValue(
                  { descripcion: c.descripcion || '' },
                  { emitEvent: false }
                );
              }
            });
          }
        }
      });
    }

    // 3. Checklist
    if (data?.checklist && Array.isArray(data.checklist)) {
      data.checklist.forEach((grupo: any[], i: number) => {
        if (i < this.checklistFormArray.length && Array.isArray(grupo)) {
          const grupoArray = this.checklistFormArray.at(i) as FormArray;
          grupo.forEach((respuesta: string | null, j: number) => {
            if (j < grupoArray.length) {
              grupoArray.at(j).setValue(respuesta, { emitEvent: false });
            }
          });
        }
      });
    }
  }

  /**
   * Override calculateProgress:
   * - programa: 1 campo
   * - 6 dimensiones × 6 campos clave (medios, tecnicas, instrumentos, tipoEvaluacion, participantes, momento)
   * - checklist: 12 preguntas
   * Total: 49 campos
   */
  protected override calculateProgress(): void {
    // Sección programa
    const programaValue = this.form.get('programaSeleccionado')?.value;
    const programaCompleted = programaValue ? 1 : 0;

    // Secciones por dimensión
    const dimensionSections = this.dimensionMeta.map((dim, index) => {
      const group = this.dimensionesFormArray.at(index) as FormGroup;
      let completed = 0;
      const totalFields = 6;

      const medios = group.get('medios')?.value;
      if (medios && Array.isArray(medios) && medios.length > 0) completed++;

      const tecnicas = group.get('tecnicas')?.value;
      if (tecnicas && Array.isArray(tecnicas) && tecnicas.length > 0) completed++;

      const instrumentos = group.get('instrumentos')?.value;
      if (instrumentos && Array.isArray(instrumentos) && instrumentos.length > 0) completed++;

      if (group.get('tipoEvaluacion')?.value) completed++;
      if (group.get('participantes')?.value) completed++;
      if (group.get('momento')?.value) completed++;

      const percentage = Math.round((completed / totalFields) * 100);

      return {
        sectionName: dim.nombre,
        completedFields: completed,
        totalFields,
        percentage,
        estado: calcularEstadoAvance(percentage)
      };
    });

    // Sección checklist
    let checklistCompleted = 0;
    let checklistTotal = 0;
    this.checklistConfig.forEach((grupo, i) => {
      const grupoArray = this.checklistFormArray.at(i) as FormArray;
      grupo.preguntas.forEach((_p, j) => {
        checklistTotal++;
        if (grupoArray.at(j)?.value !== null) {
          checklistCompleted++;
        }
      });
    });
    const checklistPercentage = checklistTotal > 0
      ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

    const allSections = [
      {
        sectionName: 'programa',
        completedFields: programaCompleted,
        totalFields: 1,
        percentage: programaCompleted * 100,
        estado: calcularEstadoAvance(programaCompleted * 100)
      },
      ...dimensionSections,
      {
        sectionName: 'checklist',
        completedFields: checklistCompleted,
        totalFields: checklistTotal,
        percentage: checklistPercentage,
        estado: calcularEstadoAvance(checklistPercentage)
      }
    ];

    const totalFields = allSections.reduce((sum, s) => sum + s.totalFields, 0);
    const totalCompleted = allSections.reduce((sum, s) => sum + s.completedFields, 0);
    const totalPercentage = totalFields > 0 ? Math.round((totalCompleted / totalFields) * 100) : 0;

    this._progress.set({
      sections: allSections,
      totalPercentage,
      estado: calcularEstadoAvance(totalPercentage)
    });
  }

  /**
   * Obtiene el estado de progreso de un grupo del checklist
   */
  getChecklistGrupoEstado(grupoIndex: number): EstadoAvance {
    const grupoArray = this.checklistFormArray.at(grupoIndex) as FormArray;
    let completed = 0;
    const total = grupoArray.length;
    grupoArray.controls.forEach(c => {
      if (c.value !== null) completed++;
    });
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return calcularEstadoAvance(percentage);
  }
}
