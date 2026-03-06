import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SectionProgress, calcularEstadoAvance } from '../../../core/models';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { FieldsetModule } from 'primeng/fieldset';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';
import { Contentwidget } from '../caracteriza-component/components/contenido/contentwidget';

// Servicios
import { ContentService } from '../../../core/services/content.service';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';

@Component({
  selector: 'app-factores-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    FluidModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    TextareaModule,
    AccordionModule,
    TagModule,
    TooltipModule,
    MessageModule,
    FieldsetModule,
    Contentwidget,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    BitacoraCommentButtonComponent
  ],
  templateUrl: './factores-component.html',
  styleUrl: './factores-component.css'
})
export class FactoresComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private contentService = inject(ContentService);
  private contentSubscription?: Subscription;

  // Código de sección para Factores
  protected seccionCodigo = 'factores';

  // Configuración de secciones para el cálculo de progreso
  protected sectionsConfig: SectionConfig[] = [
    {
      name: 'ecosistema',
      formGroupName: 'ecosistema',
      fields: ['numEstudiantes', 'numDocentes', 'liderExito', 'liderFortalecimiento', 'unidadAdscrita', 'unidadesDicta', 'aspectosImportantes']
    },
    {
      name: 'panel1',
      formGroupName: 'panel1',
      fields: ['pregunta1', 'pregunta2', 'pregunta3', 'pregunta4', 'pregunta5', 'pregunta6', 'pregunta7', 'pregunta8', 'pregunta9']
    },
    {
      name: 'panel2',
      formGroupName: 'panel2',
      fields: ['pregunta10', 'pregunta11', 'pregunta12', 'pregunta13']
    },
    {
      name: 'panel3',
      formGroupName: 'panel3',
      fields: ['pregunta14', 'pregunta15', 'pregunta16', 'pregunta17']
    }
  ];

  // Opciones para los selects
  pregunta1Options = [
    { name: 'Pregrado', code: 'pregrado' },
    { name: 'Posgrado', code: 'posgrado' },
  ];

  pregunta2Options = [
    { name: 'Inicio', code: 'inicio' },
    { name: 'Mitad', code: 'mitad' },
    { name: 'Final', code: 'final' },
  ];

  pregunta4Options = [
    { name: 'Presencial', code: 'presencial' },
    { name: 'Virtual', code: 'virtual' },
    { name: 'Híbrido', code: 'hibrido' },
  ];

  pregunta5Options = [
    { name: 'Teórico', code: 'teorico' },
    { name: 'Práctico', code: 'practico' },
    { name: 'Una combinación de ambos', code: 'teorico-practico' },
  ];

  pregunta6Options = [
    { name: 'Fundamentación', code: 'fundamentacion' },
    { name: 'Disciplinar', code: 'disciplinar' },
    { name: 'Profundización', code: 'profundizacion' },
    { name: 'Electivo', code: 'electivo' },
  ];

  pregunta7Options = [
    { name: 'Requiere actualización permanente', code: 'actualizacion' },
    { name: 'Es una temática estable', code: 'estable' },
  ];

  pregunta8Options = [
    { name: 'Prerrequisitos', code: 'prerrequisitos' },
    { name: 'Correquisitos', code: 'correquisitos' },
  ];

  YesNoOptions = [
    { name: 'Si', code: 'si' },
    { name: 'No', code: 'no' },
  ];

  get raArray(): FormArray {
    return this.form.get('resultadosAprendizaje') as FormArray;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.setupPregunta9Listener();
    // Sincronizar cambios del widget de contenidos con el formulario para el auto-save
    this.contentSubscription = this.contentService.dataChanged$.subscribe(() => {
      this.form.patchValue({ contenidos: this.contentService.getData() });
    });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.contentSubscription?.unsubscribe();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      ecosistema: this.fb.group({
        numEstudiantes: [null, [Validators.min(1)]],
        numDocentes: [null, [Validators.min(1)]],
        liderExito: [''],
        liderFortalecimiento: [''],
        unidadAdscrita: [''],
        unidadesDicta: [''],
        aspectosImportantes: ['']
      }),
      resultadosAprendizaje: this.fb.array([]),
      contenidos: this.fb.control(null),
      panel1: this.fb.group({
        pregunta1: ['', Validators.required],
        pregunta2: ['', Validators.required],
        pregunta3: ['', Validators.required],
        pregunta4: ['', Validators.required],
        pregunta5: ['', Validators.required],
        pregunta6: ['', Validators.required],
        pregunta7: ['', Validators.required],
        pregunta8: ['', Validators.required],
        pregunta9: ['', Validators.required],
        detallePregunta9: ['']
      }),
      panel2: this.fb.group({
        pregunta10: ['', Validators.required],
        pregunta11: ['', Validators.required],
        pregunta12: ['', Validators.required],
        pregunta13: ['', Validators.required],
      }),
      panel3: this.fb.group({
        pregunta14: ['', Validators.required],
        pregunta15: ['', Validators.required],
        pregunta16: ['', Validators.required],
        pregunta17: ['', Validators.required],
      })
    });
  }

  protected override patchFormWithData(data: any): void {
    const { resultadosAprendizaje, contenidos, ...rest } = data;

    // Parchear grupos de formulario normales
    this.form.patchValue(rest, { emitEvent: false });

    // Restaurar el FormArray de resultados de aprendizaje
    if (Array.isArray(resultadosAprendizaje)) {
      const raArray = this.raArray;
      raArray.clear({ emitEvent: false });
      resultadosAprendizaje.forEach((ra: string) => {
        raArray.push(this.fb.control(ra), { emitEvent: false });
      });
    }

    // Cargar datos del widget de contenidos
    if (contenidos) {
      this.contentService.loadFromData(contenidos);
    }
  }

  addRA(): void {
    this.raArray.push(this.fb.control(''));
  }

  removeRA(index: number): void {
    this.raArray.removeAt(index);
  }

  protected override calculateProgress(): void {
    // Cálculo estándar para ecosistema, panel1, panel2, panel3
    super.calculateProgress();

    // Agregar secciones basadas en FormArray y ContentService
    const current = this._progress();

    const raCount = this.raArray.length;
    const raPercentage = raCount > 0 ? 100 : 0;
    const raSectionProgress: SectionProgress = {
      sectionName: 'resultadosAprendizaje',
      completedFields: raCount > 0 ? 1 : 0,
      totalFields: 1,
      percentage: raPercentage,
      estado: calcularEstadoAvance(raPercentage)
    };

    const contenidosData = this.contentService.getData();
    const topics = contenidosData.topics || [];
    const subtopicsArr = contenidosData.subtopics || [];
    let contenidosPercentage: number;
    if (topics.length === 0) {
      contenidosPercentage = 0;
    } else {
      const allHaveSubtopics = topics.every((t: any) => subtopicsArr.some((st: any) => st.topicId === t.id));
      contenidosPercentage = allHaveSubtopics ? 100 : 50;
    }
    const contenidosSectionProgress: SectionProgress = {
      sectionName: 'contenidos',
      completedFields: contenidosPercentage === 100 ? 1 : 0,
      totalFields: 1,
      percentage: contenidosPercentage,
      estado: calcularEstadoAvance(contenidosPercentage)
    };

    const allSections = [...current.sections, raSectionProgress, contenidosSectionProgress];
    const totalFields = allSections.reduce((sum, s) => sum + s.totalFields, 0);
    const completedFields = allSections.reduce((sum, s) => sum + s.completedFields, 0);
    const totalPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    this._progress.set({
      sections: allSections,
      totalPercentage,
      estado: calcularEstadoAvance(totalPercentage)
    });
  }

  private setupPregunta9Listener(): void {
    this.form.get('panel1.pregunta9')?.valueChanges.subscribe((value: string) => {
      const detalleControl = this.form.get('panel1.detallePregunta9');
      if (value === 'si') {
        detalleControl?.setValidators([Validators.required]);
      } else {
        detalleControl?.clearValidators();
        detalleControl?.setValue('', { emitEvent: false });
      }
      detalleControl?.updateValueAndValidity();
    });
  }
}
