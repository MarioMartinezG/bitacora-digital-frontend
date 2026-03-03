import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserRole, ROLE_LABELS } from '../../../core/models/role.model';
import { UsuariosService } from '../../../core/services/usuarios.service';

@Component({
  selector: 'app-usuario-form',
  templateUrl: './usuario-form.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MultiSelectModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class UsuarioForm implements OnInit {
  form!: FormGroup;
  isEditMode = signal(false);
  usuarioId = signal<number | null>(null);
  cargando = signal(false);
  guardando = signal(false);

  rolesOptions = [
    { label: ROLE_LABELS[UserRole.ESTUDIANTE], value: UserRole.ESTUDIANTE },
    { label: ROLE_LABELS[UserRole.TUTOR], value: UserRole.TUTOR },
    { label: ROLE_LABELS[UserRole.COORDINADOR], value: UserRole.COORDINADOR }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.usuarioId.set(Number(id));
      this.loadUsuario(Number(id));
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      roles: [[] as number[], Validators.required]
    });
  }

  private loadUsuario(id: number): void {
    this.cargando.set(true);
    this.usuariosService.obtenerUsuario(id).subscribe({
      next: (usuario) => {
        this.form.patchValue({
          nombre: usuario.nombre,
          correo: usuario.correo,
          roles: usuario.roles
        });
        this.form.get('contrasena')?.clearValidators();
        this.form.get('contrasena')?.updateValueAndValidity();
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el usuario',
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
    const formData = this.form.value;

    if (this.isEditMode()) {
      this.usuariosService.actualizarUsuario(this.usuarioId()!, formData).subscribe({
        next: () => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Actualizado',
            detail: 'Usuario actualizado correctamente',
            life: 3000
          });
          setTimeout(() => this.router.navigate(['/home/coordinador/usuarios']), 1000);
        },
        error: () => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el usuario',
            life: 3000
          });
        }
      });
    } else {
      this.usuariosService.crearUsuario(formData).subscribe({
        next: () => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Creado',
            detail: 'Usuario creado correctamente',
            life: 3000
          });
          setTimeout(() => this.router.navigate(['/home/coordinador/usuarios']), 1000);
        },
        error: () => {
          this.guardando.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el usuario',
            life: 3000
          });
        }
      });
    }
  }

  cancelar(): void {
    this.router.navigate(['/home/coordinador/usuarios']);
  }

  get titulo(): string {
    return this.isEditMode() ? 'Editar Usuario' : 'Nuevo Usuario';
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }
}
