import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { FieldsetModule } from 'primeng/fieldset';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';
import { calcularEstadoAvance } from '../../../core/models';
import { FactoresJson } from '../../../core/models/bitacora.model';
import { Topic } from '../../../core/models/topic.model';
import { Subtopic } from '../../../core/models/subtopic.model';

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
    SelectModule,
    MessageModule,
    FieldsetModule,
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

  topics = signal<Topic[]>([]);
  subtopics = signal<Subtopic[]>([]);
  factoresCargado = signal(false);

  get mediosFormArray(): FormArray {
    return this.form.get('mediosEducativos') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.cargarContenidosFactores();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private cargarContenidosFactores(): void {
    this.bitacoraService.obtenerSeccion('factores').subscribe({
      next: (respuesta) => {
        const datos = respuesta?.datos as FactoresJson | undefined;
        const contenidos = datos?.contenidos;
        this.topics.set(contenidos?.topics ?? []);
        this.subtopics.set(contenidos?.subtopics ?? []);
        this.factoresCargado.set(true);
      },
      error: () => {
        this.factoresCargado.set(true);
      }
    });
  }

  getSubtopicsForTema(topicName: string): Subtopic[] {
    const topic = this.topics().find(t => t.name === topicName);
    if (!topic) return [];
    return this.subtopics().filter(s => s.topicId === topic.id);
  }

  onTemaChange(index: number): void {
    this.mediosFormArray.at(index).patchValue({ subtema: '' });
  }

  protected initForm(): void {
    this.form = this.fb.group({
      mediosEducativos: this.fb.array([])
    });
  }

  agregarMedio(): void {
    this.mediosFormArray.push(this.crearFilaGroup({}));
    this.calculateProgress();
  }

  eliminarMedio(index: number): void {
    this.mediosFormArray.removeAt(index);
    this.calculateProgress();
  }

  private crearFilaGroup(medio: any): FormGroup {
    return this.fb.group({
      tema: [medio.tema || ''],
      subtema: [medio.subtema || ''],
      nombre: [medio.nombre || ''],
      descripcion: [medio.descripcion || ''],
      referencia: [medio.referencia || ''],
      propositoPedagogico: [medio.propositoPedagogico || '']
    });
  }

  protected override patchFormWithData(data: any): void {
    if (data?.mediosEducativos && Array.isArray(data.mediosEducativos)) {
      const fa = this.mediosFormArray;
      fa.clear();
      data.mediosEducativos.forEach((medio: any) => {
        fa.push(this.crearFilaGroup(medio));
      });
    }
  }

  protected override calculateProgress(): void {
    const filas = this.mediosFormArray.controls;
    const total = filas.length;
    const completas = filas.filter(fila => {
      const v = fila.value;
      return v.tema?.trim() && v.nombre?.trim();
    }).length;
    const percentage = total > 0 ? Math.round((completas / total) * 100) : 0;

    this._progress.set({
      sections: [{
        sectionName: 'mediosEducativos',
        completedFields: completas,
        totalFields: total,
        percentage,
        estado: calcularEstadoAvance(percentage)
      }],
      totalPercentage: percentage,
      estado: calcularEstadoAvance(percentage)
    });
  }
}
