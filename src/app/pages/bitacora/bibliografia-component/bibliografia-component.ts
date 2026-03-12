import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';
import { calcularEstadoAvance } from '../../../core/models';

@Component({
  selector: 'app-bibliografia-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FluidModule,
    InputTextModule,
    TextareaModule,
    TagModule,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    BitacoraCommentButtonComponent
  ],
  templateUrl: './bibliografia-component.html',
})
export class BibliografiaComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  protected seccionCodigo = 'bibliografia';
  protected sectionsConfig: SectionConfig[] = [];

  get bibliografiaFormArray(): FormArray {
    return this.form.get('bibliografia') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      bibliografia: this.fb.array([])
    });
  }

  agregarReferencia(): void {
    this.bibliografiaFormArray.push(this.fb.group({
      autor: [''],
      titulo: [''],
      year: [''],
      editorial: [''],
      url: ['']
    }));
    this.calculateProgress();
  }

  eliminarReferencia(index: number): void {
    this.bibliografiaFormArray.removeAt(index);
    this.calculateProgress();
  }

  protected override patchFormWithData(data: any): void {
    if (data?.bibliografia && Array.isArray(data.bibliografia)) {
      const formArray = this.bibliografiaFormArray;
      formArray.clear();
      data.bibliografia.forEach((ref: any) => {
        formArray.push(this.fb.group({
          autor: [ref.autor || ''],
          titulo: [ref.titulo || ''],
          year: [ref.year || ''],
          editorial: [ref.editorial || ''],
          url: [ref.url || '']
        }));
      });
    }
  }

  protected override calculateProgress(): void {
    const hasRows = this.bibliografiaFormArray.length > 0;
    const percentage = hasRows ? 100 : 0;

    this._progress.set({
      sections: [
        {
          sectionName: 'bibliografia',
          completedFields: hasRows ? 1 : 0,
          totalFields: 1,
          percentage,
          estado: calcularEstadoAvance(percentage)
        }
      ],
      totalPercentage: percentage,
      estado: calcularEstadoAvance(percentage)
    });
  }
}
