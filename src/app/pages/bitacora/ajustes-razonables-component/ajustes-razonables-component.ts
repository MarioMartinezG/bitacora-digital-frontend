import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

// Componentes PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';

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
    LoadingComponent
  ],
  templateUrl: './ajustes-razonables-component.html',
})
export class AjustesRazonablesComponent implements OnInit {

  ajustesForm!: FormGroup;

  opcionesSiNo = [
    { label: 'Sí', value: 'SI' },
    { label: 'No', value: 'NO' }
  ];

  ajustesData = [
    { desde: 'Los contenidos', ajuste: 'Proporcionar materiales en formatos accesibles (braille, audio, digital)' },
    { desde: 'Los contenidos', ajuste: 'Simplificar el lenguaje técnico.' },
    { desde: 'Los contenidos', ajuste: 'Utilizar imágenes descriptivas y diagramas.' },
    { desde: 'Los contenidos', ajuste: 'Ofrecer resúmenes o guías de estudio.' },
    { desde: 'Las actividades', ajuste: 'Permitir la participación en grupos de trabajo con apoyo.' },
    { desde: 'Las actividades', ajuste: 'Adaptar las tareas según las habilidades del estudiante' },
    { desde: 'Las actividades', ajuste: 'Ofrecer opciones de entrega de tareas (oral, escrita, digital)' },
    { desde: 'La evaluación', ajuste: 'Extender el tiempo para realizar las evaluaciones.' },
    { desde: 'La evaluación', ajuste: 'Permitir el uso de herramientas tecnológicas.' },
    { desde: 'La evaluación', ajuste: 'Ofrecer opciones de evaluación alternativas.' },
    { desde: 'Las dinámicas', ajuste: 'Proporcionar apoyo adicional en clase (tutorías, asistentes personales).' },
    { desde: 'Las dinámicas', ajuste: 'Facilitar la comunicación por correo electrónico, chat, videoconferencias.' },
    { desde: 'Las dinámicas', ajuste: 'Crear un ambiente de aula inclusivo y respetuoso.' },
  ];

  // metadata para agrupar manualmente
  groupCountMap: { [key: string]: number } = {};
  groupFirstIndex: { [key: string]: number } = {};

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.computeGroupMeta(); // prepara groupCountMap y groupFirstIndex
    this.ajustesForm = this.fb.group({
      ajustes: this.fb.array(this.ajustesData.map(a => this.crearFila(a)))
    });
  }

  // Getter para el FormArray
  get ajustesArray(): FormArray {
    return this.ajustesForm.get('ajustes') as FormArray;
  }

  crearFila(data: any): FormGroup {
    return this.fb.group({
      desde: [data.desde],
      ajuste: [data.ajuste],
      siNo: [null],
      comoHacerlo: ['']
    });
  }

  // Construye mapas: cuántas filas por grupo y el índice de la primera aparición
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

  // Devuelve un array "limpio" listo para enviar al backend
  guardar(): void {
    const payload = this.ajustesArray.controls.map(g => ({
      desde: g.get('desde')?.value,
      ajuste: g.get('ajuste')?.value,
      siNo: g.get('siNo')?.value,
      comoHacerlo: g.get('comoHacerlo')?.value
    }));
    console.log('payload', payload);
    // aquí llamar a tu servicio: this.miService.save(payload).subscribe(...)
  }
}
