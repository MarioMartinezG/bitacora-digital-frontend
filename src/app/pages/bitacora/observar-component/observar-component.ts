import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { TagModule } from 'primeng/tag';
import { FieldsetModule } from 'primeng/fieldset';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

// Componentes compartidos
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';
import { calcularEstadoAvance } from '../../../core/models';

export interface SituacionItem {
  id: number;
  situacion: string;
  justificacion: string;
}

@Component({
  selector: 'app-observar-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FluidModule,
    TagModule,
    FieldsetModule,
    SelectModule,
    TooltipModule,
    DividerModule,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    BitacoraCommentButtonComponent,
    ExportButtonComponent
  ],
  templateUrl: './observar-component.html',
  styleUrl: './observar-component.css'
})
export class ObservarComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  protected seccionCodigo = 'observar';
  protected sectionsConfig: SectionConfig[] = [];

  readonly SITUACIONES: SituacionItem[] = [
    {
      id: 1,
      situacion: 'Camilo no presentó dos evaluaciones.',
      justificacion: 'No presentar evaluaciones afecta directamente el proceso formativo y es una manifestación concreta de dificultad académica.'
    },
    {
      id: 2,
      situacion: 'Lucía comenta que está durmiendo poco.',
      justificacion: 'Las alteraciones en el descanso pueden afectar la concentración, la regulación emocional y el rendimiento académico.'
    },
    {
      id: 3,
      situacion: 'Diego menciona que empezó a trabajar en horario nocturno.',
      justificacion: 'Este cambio en sus condiciones de vida puede incidir en el desempeño académico y bienestar.'
    },
    {
      id: 4,
      situacion: 'Pilar no ha podido adquirir el software requerido.',
      justificacion: 'Las dificultades de acceso a recursos necesarios para el aprendizaje, vinculada a factor financiero y académico impactan negativamente en el rendimiento.'
    },
    {
      id: 5,
      situacion: 'Germán expresa que no está seguro de continuar en el programa.',
      justificacion: 'Es una señal de crisis de carrera, asociada a riesgo académico y psicosocial.'
    },
    {
      id: 6,
      situacion: 'Hellen tuvo buen desempeño al inicio del semestre, pero ahora ha bajado notablemente.',
      justificacion: 'Indica que las dificultades son recientes; permite identificar un cambio en la trayectoria, no un patrón previo.'
    },
    {
      id: 7,
      situacion: 'José no justificó formalmente sus ausencias.',
      justificacion: 'Puede ser un descuido puntual o parte de un patrón emergente.'
    },
    {
      id: 8,
      situacion: 'Karen se muestra distraída en clase.',
      justificacion: 'Es un cambio observable en el comportamiento académico que puede estar vinculado a sobrecarga emocional o dificultades externas.'
    }
  ];

  readonly SI_NO_OPTIONS = [
    { label: 'Sí', value: 'si' },
    { label: 'No', value: 'no' }
  ];

  readonly CATEGORIAS = [
    { key: 'cat1', label: 'Proceso académico habitual que puedo resolver en mi clase' },
    { key: 'cat2', label: 'Posible señal de alerta. Debo informar al líder' },
    { key: 'cat3', label: 'Información insuficiente. (Necesito observar más)' }
  ];

  get situacionesArray(): FormArray {
    return this.form.get('situaciones') as FormArray;
  }

  protected initForm(): void {
    this.form = this.fb.group({
      situaciones: this.fb.array(
        this.SITUACIONES.map(s => this.fb.group({
          id: [s.id],
          situacion: [s.situacion],
          cat1: [''],
          cat2: [''],
          cat3: ['']
        }))
      )
    });
  }

  protected override patchFormWithData(data: any): void {
    const savedMap = new Map<number, any>();
    (data?.situaciones || []).forEach((entry: any) => {
      if (entry.id) savedMap.set(entry.id, entry);
    });

    this.situacionesArray.controls.forEach(ctrl => {
      const g = ctrl as FormGroup;
      const id = g.get('id')?.value;
      const saved = id ? savedMap.get(id) : null;
      if (!saved) return;
      g.patchValue({
        cat1: saved.cat1 || '',
        cat2: saved.cat2 || '',
        cat3: saved.cat3 || ''
      }, { emitEvent: false });
    });
  }

  protected override calculateProgress(): void {
    let totalFields = 0;
    let completedFields = 0;

    this.situacionesArray.controls.forEach(ctrl => {
      const g = ctrl as FormGroup;
      ['cat1', 'cat2', 'cat3'].forEach(key => {
        totalFields++;
        if (g.get(key)?.value) completedFields++;
      });
    });

    const totalPercentage = totalFields > 0
      ? Math.round((completedFields / totalFields) * 100)
      : 0;

    this._progress.set({
      sections: [{
        sectionName: 'observar',
        completedFields,
        totalFields,
        percentage: totalPercentage,
        estado: calcularEstadoAvance(totalPercentage)
      }],
      totalPercentage,
      estado: calcularEstadoAvance(totalPercentage)
    });
  }
}
