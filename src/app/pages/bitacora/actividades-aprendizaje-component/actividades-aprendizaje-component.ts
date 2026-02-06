import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';

// Models
import { calcularEstadoAvance } from '../../../core/models';

/** Metadatos de display para cada dimensión */
interface DimensionMeta {
  dimension: string;
  resultado: string;
  icon: string;
  iconColor: string;
}

@Component({
  selector: 'app-actividades-aprendizaje-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    FluidModule,
    SelectModule,
    TextareaModule,
    TagModule,
    LoadingComponent,
    SaveStatusIndicatorComponent
  ],
  templateUrl: './actividades-aprendizaje-component.html',
  styleUrl: './actividades-aprendizaje-component.css'
})
export class ActividadesAprendizajeComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  // Código de sección
  protected seccionCodigo = 'actividades';

  // No usamos sectionsConfig genérico, override personalizado de calculateProgress
  protected sectionsConfig: SectionConfig[] = [];

  // Metadatos estáticos de cada dimensión (display only)
  dimensionMeta: DimensionMeta[] = [
    {
      dimension: 'Compromiso o valoración',
      resultado: 'Desarrolla la capacidad de reconocer el valor del aprendizaje.',
      icon: 'pi pi-bolt',
      iconColor: 'text-primary'
    },
    {
      dimension: 'Dimensiones humanas del aprendizaje',
      resultado: 'Reconoce la importancia del trabajo colaborativo y la empatía.',
      icon: 'pi pi-users',
      iconColor: 'text-green-500'
    },
    {
      dimension: 'Conocimiento Fundamental',
      resultado: 'Comprende los fundamentos teóricos del curso.',
      icon: 'pi pi-book',
      iconColor: 'text-orange-500'
    },
    {
      dimension: 'Aplicación del aprendizaje',
      resultado: 'Aplica los conocimientos adquiridos a contextos reales.',
      icon: 'pi pi-cog',
      iconColor: 'text-cyan-600'
    },
    {
      dimension: 'Integración',
      resultado: 'Integra los saberes del curso con otras áreas del conocimiento.',
      icon: 'pi pi-link',
      iconColor: 'text-indigo-500'
    },
    {
      dimension: 'Aprender a aprender',
      resultado: 'Desarrolla autonomía en su proceso de aprendizaje.',
      icon: 'pi pi-compass',
      iconColor: 'text-purple-500'
    }
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

  // Getter para el FormArray de dimensiones
  get dimensionesFormArray(): FormArray {
    return this.form.get('dimensiones') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      dimensiones: this.fb.array(
        this.dimensionMeta.map(dim => this.fb.group({
          dimension: [dim.dimension],
          resultado: [dim.resultado],
          metodologia: [null],
          descripcion: ['']
        }))
      )
    });
  }

  /**
   * Override patchFormWithData para manejar el FormArray de dimensiones
   */
  protected override patchFormWithData(data: any): void {
    if (data?.dimensiones && Array.isArray(data.dimensiones)) {
      const formArray = this.dimensionesFormArray;
      data.dimensiones.forEach((dimData: any, index: number) => {
        if (index < formArray.length) {
          formArray.at(index).patchValue({
            metodologia: dimData.metodologia || null,
            descripcion: dimData.descripcion || ''
          }, { emitEvent: false });
        }
      });
    }
  }

  /**
   * Override calculateProgress con lógica personalizada:
   * - 6 dimensiones, 2 campos cada una (metodologia + descripcion) = 12 campos totales
   * - Cada dimensión genera su propia sección de progreso
   */
  protected override calculateProgress(): void {
    const sections = this.dimensionMeta.map((dim, index) => {
      const group = this.dimensionesFormArray.at(index) as FormGroup;
      let completed = 0;

      const metodologia = group.get('metodologia')?.value;
      if (metodologia !== null && metodologia !== undefined && metodologia !== '') {
        completed++;
      }

      const descripcion = group.get('descripcion')?.value;
      if (descripcion && typeof descripcion === 'string' && descripcion.trim().length > 0) {
        completed++;
      }

      const percentage = Math.round((completed / 2) * 100);

      return {
        sectionName: dim.dimension,
        completedFields: completed,
        totalFields: 2,
        percentage,
        estado: calcularEstadoAvance(percentage)
      };
    });

    const totalFields = sections.reduce((sum, s) => sum + s.totalFields, 0);
    const completedFields = sections.reduce((sum, s) => sum + s.completedFields, 0);
    const totalPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    this._progress.set({
      sections,
      totalPercentage,
      estado: calcularEstadoAvance(totalPercentage)
    });
  }
}
