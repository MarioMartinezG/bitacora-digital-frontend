import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AsignaturasService } from '../../../core/services/asignaturas.service';

@Component({
  selector: 'app-asignatura-form',
  templateUrl: './asignatura-form.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    SkeletonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class AsignaturaForm implements OnInit {
  form!: FormGroup;
  isEditMode = signal(false);
  asignaturaId = signal<number | null>(null);
  cargando = signal(false);
  guardando = signal(false);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private asignaturasService: AsignaturasService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.asignaturaId.set(Number(id));
      this.loadAsignatura(Number(id));
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: [''],
      creditos: [''],
      semestre: ['']
    });
  }

  private loadAsignatura(id: number): void {
    this.cargando.set(true);
    this.asignaturasService.obtenerAsignatura(id).subscribe({
      next: (asignatura) => {
        this.form.patchValue({
          codigo: asignatura.codigo,
          nombre: asignatura.nombre,
          descripcion: asignatura.descripcion,
          creditos: asignatura.creditos ?? '',
          semestre: asignatura.semestre ?? ''
        });
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la asignatura',
          life: 3000
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formValue = this.form.value;
    const data = {
      codigo: formValue.codigo,
      nombre: formValue.nombre,
      descripcion: formValue.descripcion || undefined,
      creditos: formValue.creditos ? Number(formValue.creditos) : undefined,
      semestre: formValue.semestre ? Number(formValue.semestre) : undefined
    };

    if (this.isEditMode()) {
      this.asignaturasService.actualizarAsignatura(this.asignaturaId()!, data).subscribe({
        next: () => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Asignatura actualizada correctamente',
            life: 3000
          });
          setTimeout(() => this.router.navigate(['/home/coordinador/asignaturas']), 1000);
        },
        error: () => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar la asignatura',
            life: 3000
          });
        }
      });
    } else {
      this.asignaturasService.crearAsignatura(data).subscribe({
        next: () => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Asignatura creada correctamente',
            life: 3000
          });
          setTimeout(() => this.router.navigate(['/home/coordinador/asignaturas']), 1000);
        },
        error: () => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear la asignatura',
            life: 3000
          });
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/home/coordinador/asignaturas']);
  }

  get titulo(): string {
    return this.isEditMode() ? 'Editar Asignatura' : 'Nueva Asignatura';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
