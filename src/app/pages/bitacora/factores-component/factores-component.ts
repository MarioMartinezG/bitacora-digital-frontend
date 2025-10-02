import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';

@Component({
  selector: 'app-factores-component',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    FluidModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
    FieldsetModule,
    AccordionModule,
    TagModule,
    LoadingComponent
  ],
  templateUrl: './factores-component.html',
})
export class FactoresComponent implements OnInit {

  // Listas a utilizar
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

  form!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
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

    this.form.get('panel1.pregunta9')?.valueChanges.subscribe((value: string) => {
      const detalleControl = this.form.get('panel1.detallePregunta9');
      if (value === 'si') {
        detalleControl?.setValidators([Validators.required]);
      } else {
        detalleControl?.clearValidators();
        detalleControl?.setValue('');
      }
      detalleControl?.updateValueAndValidity();
    });
  }



  onSubmit(): void {
    if (this.form.valid) {
      console.log('Formulario listo para enviar:', this.form.value);
      // TODO: llamar servicio backend para guardar
    } else {
      this.form.markAllAsTouched();
    }
  }

}
