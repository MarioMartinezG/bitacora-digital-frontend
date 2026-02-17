import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';

// Models
import { SectionProgress, calcularEstadoAvance } from '../../../core/models';

@Component({
  selector: 'app-ajustes-razonables-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    TableModule,
    SelectModule,
    TextareaModule,
    ButtonModule,
    TagModule,
    LoadingComponent,
    SaveStatusIndicatorComponent,
    BitacoraCommentButtonComponent
  ],
  templateUrl: './ajustes-razonables-component.html',
  styleUrl: './ajustes-razonables-component.css'
})
export class AjustesRazonablesComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  // Codigo de seccion para Ajustes Razonables
  protected seccionCodigo = 'ajustes';

  // Este componente no tiene secciones tradicionales, calculamos progreso de forma diferente
  protected sectionsConfig: SectionConfig[] = [];

  opcionesSiNo = [
    { label: 'Si', value: 'SI' },
    { label: 'No', value: 'NO' }
  ];

  ajustesData = [
    { desde: 'Los contenidos', ajuste: 'Proporcionar materiales en formatos accesibles (braille, audio, digital)' },
    { desde: 'Los contenidos', ajuste: 'Simplificar el lenguaje tecnico.' },
    { desde: 'Los contenidos', ajuste: 'Utilizar imagenes descriptivas y diagramas.' },
    { desde: 'Los contenidos', ajuste: 'Ofrecer resumenes o guias de estudio.' },
    { desde: 'Las actividades', ajuste: 'Permitir la participacion en grupos de trabajo con apoyo.' },
    { desde: 'Las actividades', ajuste: 'Adaptar las tareas segun las habilidades del estudiante' },
    { desde: 'Las actividades', ajuste: 'Ofrecer opciones de entrega de tareas (oral, escrita, digital)' },
    { desde: 'La evaluacion', ajuste: 'Extender el tiempo para realizar las evaluaciones.' },
    { desde: 'La evaluacion', ajuste: 'Permitir el uso de herramientas tecnologicas.' },
    { desde: 'La evaluacion', ajuste: 'Ofrecer opciones de evaluacion alternativas.' },
    { desde: 'Las dinamicas', ajuste: 'Proporcionar apoyo adicional en clase (tutorias, asistentes personales).' },
    { desde: 'Las dinamicas', ajuste: 'Facilitar la comunicacion por correo electronico, chat, videoconferencias.' },
    { desde: 'Las dinamicas', ajuste: 'Crear un ambiente de aula inclusivo y respetuoso.' },
  ];

  // Metadata para agrupar filas visualmente
  groupCountMap: { [key: string]: number } = {};
  groupFirstIndex: { [key: string]: number } = {};

  // Getter para el FormArray
  get ajustesArray(): FormArray {
    return this.form.get('ajustes') as FormArray;
  }

  override ngOnInit(): void {
    this.computeGroupMeta();
    super.ngOnInit();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected initForm(): void {
    this.form = this.fb.group({
      ajustes: this.fb.array(this.ajustesData.map(a => this.crearFila(a)))
    });
  }

  private crearFila(data: { desde: string; ajuste: string }): FormGroup {
    return this.fb.group({
      desde: [data.desde],
      ajuste: [data.ajuste],
      siNo: [null],
      comoHacerlo: ['']
    });
  }

  /**
   * Sobrescribimos patchFormWithData para manejar el FormArray
   */
  protected override patchFormWithData(data: any): void {
    if (data?.ajustes && Array.isArray(data.ajustes)) {
      // Solo actualizamos siNo y comoHacerlo de cada fila
      data.ajustes.forEach((item: any, index: number) => {
        if (index < this.ajustesArray.length) {
          const control = this.ajustesArray.at(index);
          control.patchValue({
            siNo: item.siNo,
            comoHacerlo: item.comoHacerlo
          }, { emitEvent: false });
        }
      });
    }
  }

  /**
   * Sobrescribimos calculateProgress para este componente con FormArray
   * El progreso se calcula segun cuantas filas tienen siNo completado
   */
  protected override calculateProgress(): void {
    const totalFields = this.ajustesArray.length;
    let completedFields = 0;

    this.ajustesArray.controls.forEach(control => {
      const siNo = control.get('siNo')?.value;
      if (siNo !== null && siNo !== undefined && siNo !== '') {
        completedFields++;
      }
    });

    const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    const sectionProgress: SectionProgress = {
      sectionName: 'ajustes',
      completedFields,
      totalFields,
      percentage,
      estado: calcularEstadoAvance(percentage)
    };

    this._progress.set({
      sections: [sectionProgress],
      totalPercentage: percentage,
      estado: calcularEstadoAvance(percentage)
    });
  }

  /**
   * Obtiene el progreso de la seccion de ajustes
   */
  getAjustesProgress(): SectionProgress | undefined {
    return this.progress().sections.find(s => s.sectionName === 'ajustes');
  }

  // Construye mapas: cuantas filas por grupo y el indice de la primera aparicion
  private computeGroupMeta(): void {
    this.groupCountMap = {};
    this.groupFirstIndex = {};
    this.ajustesData.forEach((item, idx) => {
      const key = item.desde;
      if (!(key in this.groupCountMap)) {
        this.groupCountMap[key] = 0;
        this.groupFirstIndex[key] = idx;
      }
      this.groupCountMap[key]++;
    });
  }

  // Utilizado desde la plantilla para decidir si mostrar la celda "Desde"
  isFirstOfGroup(index: number, desde: string): boolean {
    return this.groupFirstIndex[desde] === index;
  }
}
