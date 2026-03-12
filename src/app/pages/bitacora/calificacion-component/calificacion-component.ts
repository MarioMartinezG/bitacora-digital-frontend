import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { FieldsetModule } from 'primeng/fieldset';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

// Componentes compartidos
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';
import { calcularEstadoAvance } from '../../../core/models';

export interface EscalaItem {
  valoracion: string;
  formKey: string;
}

@Component({
  selector: 'app-calificacion-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FluidModule,
    TagModule,
    MessageModule,
    FieldsetModule,
    SelectModule,
    TextareaModule,
    TooltipModule,
    DividerModule,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    BitacoraCommentButtonComponent
  ],
  templateUrl: './calificacion-component.html',
  styleUrl: './calificacion-component.css'
})
export class CalificacionComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  protected seccionCodigo = 'calificacion';
  protected sectionsConfig: SectionConfig[] = [];

  // Escalas institucionales
  readonly ESCALA_PREGRADO: EscalaItem[] = [
    { valoracion: '5.0', formKey: 'v5_0' },
    { valoracion: '4.0', formKey: 'v4_0' },
    { valoracion: '3.0', formKey: 'v3_0' },
    { valoracion: '2.0', formKey: 'v2_0' },
    { valoracion: '1.0', formKey: 'v1_0' },
    { valoracion: '0.0', formKey: 'v0_0' },
  ];

  readonly ESCALA_POSGRADO: EscalaItem[] = [
    { valoracion: '5.0', formKey: 'v5_0' },
    { valoracion: '4.0', formKey: 'v4_0' },
    { valoracion: '3.5', formKey: 'v3_5' },
    { valoracion: '3.0', formKey: 'v3_0' },
    { valoracion: '2.0', formKey: 'v2_0' },
    { valoracion: '1.0', formKey: 'v1_0' },
    { valoracion: '0.0', formKey: 'v0_0' },
  ];

  nivelOpciones = [
    { label: 'Pregrado', value: 'pregrado' },
    { label: 'Posgrado', value: 'posgrado' },
  ];

  // Resultados de aprendizaje cargados desde Factores Situacionales
  raList = signal<string[]>([]);
  raLoaded = signal(false);

  // Nivel seleccionado para calcular la escala activa
  nivelSeleccionado = signal<string>('');

  // Mapa temporal para cruzar datos guardados con los RAs actuales
  private savedResultados = new Map<string, any>();

  // Escala activa según el nivel seleccionado
  escalaActual = computed<EscalaItem[]>(() =>
    this.nivelSeleccionado() === 'posgrado' ? this.ESCALA_POSGRADO : this.ESCALA_PREGRADO
  );

  get resultadosArray(): FormArray {
    return this.form.get('resultados') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.setupNivelListener();
    this.loadResultadosAprendizaje();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      nivel: [''],
      resultados: this.fb.array([])
    });
  }

  /** Sincroniza el signal de nivel con el control del formulario */
  private setupNivelListener(): void {
    this.form.get('nivel')?.valueChanges.subscribe(val => {
      this.nivelSeleccionado.set(val || '');
    });
  }

  /** Carga los resultados de aprendizaje desde el módulo de Factores Situacionales */
  private loadResultadosAprendizaje(): void {
    this.bitacoraService.obtenerSeccion('factores').subscribe({
      next: (respuesta) => {
        const ras: string[] = respuesta?.datos?.['resultadosAprendizaje'] || [];
        this.raList.set(ras);
        this.buildResultadosFormArray(ras);
        this.raLoaded.set(true);
      },
      error: () => {
        this.raLoaded.set(true);
      }
    });
  }

  private buildResultadosFormArray(ras: string[]): void {
    const arr = this.resultadosArray;
    arr.clear({ emitEvent: false });
    ras.forEach(ra => {
      const saved = this.savedResultados.get(ra);
      arr.push(this.createRAGroup(ra, saved), { emitEvent: false });
    });
    this.cleanStaleEntries();
  }

  private createRAGroup(nombreRA: string, saved?: any): FormGroup {
    return this.fb.group({
      nombreRA: [nombreRA],
      v5_0: [saved?.v5_0 || ''],
      v4_0: [saved?.v4_0 || ''],
      v3_5: [saved?.v3_5 || ''],
      v3_0: [saved?.v3_0 || ''],
      v2_0: [saved?.v2_0 || ''],
      v1_0: [saved?.v1_0 || ''],
      v0_0: [saved?.v0_0 || ''],
    });
  }

  protected override patchFormWithData(data: any): void {
    if (data?.nivel) {
      this.form.patchValue({ nivel: data.nivel }, { emitEvent: false });
      this.nivelSeleccionado.set(data.nivel);
    }

    this.savedResultados.clear();
    (data?.resultados || []).forEach((entry: any) => {
      if (entry.nombreRA) this.savedResultados.set(entry.nombreRA, entry);
    });

    if (this.raLoaded()) {
      this.patchResultadosFields();
      this.cleanStaleEntries();
    }
  }

  private patchResultadosFields(): void {
    this.resultadosArray.controls.forEach(ctrl => {
      const g = ctrl as FormGroup;
      const nombre = g.get('nombreRA')?.value;
      const saved = nombre ? this.savedResultados.get(nombre) : null;
      if (!saved) return;
      g.patchValue({
        v5_0: saved.v5_0 || '',
        v4_0: saved.v4_0 || '',
        v3_5: saved.v3_5 || '',
        v3_0: saved.v3_0 || '',
        v2_0: saved.v2_0 || '',
        v1_0: saved.v1_0 || '',
        v0_0: saved.v0_0 || '',
      }, { emitEvent: false });
    });
  }

  /** Fuerza un guardado si hay RAs guardados que ya no existen en Factores */
  private cleanStaleEntries(): void {
    const currentNames = new Set(this.raList());
    const hasStale = [...this.savedResultados.keys()].some(k => k && !currentNames.has(k));
    if (hasStale) {
      this.saveManually();
    }
  }

  getValoracionClass(valoracion: string): string {
    if (['5.0', '4.0'].includes(valoracion)) return 'valoracion-chip valoracion-chip--alta';
    if (['3.5', '3.0'].includes(valoracion)) return 'valoracion-chip valoracion-chip--media';
    return 'valoracion-chip valoracion-chip--baja';
  }

  protected override calculateProgress(): void {
    const nivel = this.form.get('nivel')?.value;
    const nivelCompleto = nivel ? 1 : 0;
    const escala = nivel === 'posgrado' ? this.ESCALA_POSGRADO : this.ESCALA_PREGRADO;
    const count = this.resultadosArray.length;

    let totalDescriptores = count * escala.length;
    let completedDescriptores = 0;

    for (let i = 0; i < count; i++) {
      const g = this.resultadosArray.at(i) as FormGroup;
      escala.forEach(item => {
        const val = g.get(item.formKey)?.value;
        if (val && val.trim().length > 0) completedDescriptores++;
      });
    }

    const totalFields = 1 + totalDescriptores;
    const completedFields = nivelCompleto + completedDescriptores;
    const totalPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    this._progress.set({
      sections: [{
        sectionName: 'calificacion',
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
