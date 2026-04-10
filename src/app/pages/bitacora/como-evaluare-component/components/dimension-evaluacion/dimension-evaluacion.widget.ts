import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MedioService } from '../../../../../core/services/medio.service';
import { TecnicaService } from '../../../../../core/services/tecnica.service';
import { InstrumentoService } from '../../../../../core/services/instrumento.service';
import { MedioGrupo, TecnicaGrupo, InstrumentoDTO } from '../../../../../core/models';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';

import {
  EstadoAvance,
  calcularEstadoAvance,
  getSeverityByEstado,
  getLabelByEstado
} from '../../../../../core/models';

@Component({
  selector: 'app-dimension-evaluacion-widget',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AccordionModule,
    TagModule,
    MultiSelectModule,
    InputTextModule,
    ToggleButtonModule,
    SelectModule,
    MessageModule
  ],
  templateUrl: './dimension-evaluacion.widget.html'
})
export class DimensionEvaluacionWidget implements OnInit {
  @Input() dimensionFormGroup!: FormGroup;
  @Input() programaSeleccionado: 'pregrado' | 'posgrado' | null = null;

  constructor(
    private medioService: MedioService,
    private tecnicaService: TecnicaService,
    private instrumentoService: InstrumentoService
  ) {}

  // Helpers para tags
  getSeverity = getSeverityByEstado;
  getLabel = getLabelByEstado;

  // Getter para el FormArray de criterios
  get criteriosFormArray(): FormArray {
    return this.dimensionFormGroup.get('criteriosEvaluacion') as FormArray;
  }

  // Opciones de medios — cargadas desde API
  mediosOpciones: MedioGrupo[] = [];

  // Opciones de técnicas — cargadas desde API
  tecnicasOpciones: TecnicaGrupo[] = [];

  // Opciones de instrumentos — cargadas desde API
  instrumentosOpciones: { label: string; value: string }[] = [];

  ngOnInit(): void {
    this.medioService.obtenerMediosAgrupados().subscribe({
      next: (grupos) => { this.mediosOpciones = grupos; },
      error: () => {}
    });
    this.tecnicaService.obtenerTecnicasAgrupadas().subscribe({
      next: (grupos) => { this.tecnicasOpciones = grupos; },
      error: () => {}
    });
    this.instrumentoService.obtenerInstrumentos().subscribe({
      next: (items) => { this.instrumentosOpciones = items.map(i => ({ label: i.label, value: i.value })); },
      error: () => {}
    });
  }

  tipoEvaluacionOpciones = [
    { label: 'Sumativa', value: 'sumativa' },
    { label: 'Formativa', value: 'formativa' },
    { label: 'Mixta', value: 'mixta' }
  ];

  participantesOpciones = [
    { label: 'Heteroevaluación', value: 'hetero' },
    { label: 'Coevaluación', value: 'co' },
    { label: 'Autoevaluación', value: 'auto' }
  ];

  momentosOpciones = [
    { label: 'Inicial', value: 'inicial' },
    { label: 'Media procesual', value: 'media' },
    { label: 'Final', value: 'final' }
  ];

  // Progreso por panel (para tags internos)
  getEvaluacionEstado(): EstadoAvance {
    let completed = 0;
    const medios = this.dimensionFormGroup.get('medios')?.value;
    if (medios && Array.isArray(medios) && medios.length > 0) completed++;
    const tecnicas = this.dimensionFormGroup.get('tecnicas')?.value;
    if (tecnicas && Array.isArray(tecnicas) && tecnicas.length > 0) completed++;
    const instrumentos = this.dimensionFormGroup.get('instrumentos')?.value;
    if (instrumentos && Array.isArray(instrumentos) && instrumentos.length > 0) completed++;
    return calcularEstadoAvance(Math.round((completed / 3) * 100));
  }

  getTipoParticipantesMomentoEstado(): EstadoAvance {
    let completed = 0;
    if (this.dimensionFormGroup.get('tipoEvaluacion')?.value) completed++;
    if (this.dimensionFormGroup.get('participantes')?.value) completed++;
    if (this.dimensionFormGroup.get('momento')?.value) completed++;
    return calcularEstadoAvance(Math.round((completed / 3) * 100));
  }

  getCriteriosEstado(): EstadoAvance {
    const criterios = this.criteriosFormArray;
    if (!criterios || criterios.length === 0) return 'sin_avances';
    let completed = 0;
    criterios.controls.forEach(c => {
      const desc = (c as FormGroup).get('descripcion')?.value;
      if (desc && desc.trim().length > 0) completed++;
    });
    return calcularEstadoAvance(Math.round((completed / criterios.length) * 100));
  }
}
