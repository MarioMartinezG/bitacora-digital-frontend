import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoadingService, ToastService } from '../../../core/services';
import { LoginService } from '../../../core/services/login.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { LoadingComponent } from '../../../utils/loading/loading';

function claveFortalezaValidator(control: AbstractControl): ValidationErrors | null {
  const valor = control.value as string;
  if (!valor) return null;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_\-])[A-Za-z\d@$!%*?&.#_\-]{8,}$/;
  return regex.test(valor) ? null : { claveDebil: true };
}

function clavesIgualesValidator(group: AbstractControl): ValidationErrors | null {
  const nueva = group.get('claveNueva')?.value;
  const confirmar = group.get('confirmarClave')?.value;
  return nueva && confirmar && nueva !== confirmar ? { clavesNoCoinciden: true } : null;
}

@Component({
  selector: 'app-cambiar-clave',
  templateUrl: './cambiar-clave.html',
  styleUrl: './cambiar-clave.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    PasswordModule,
    ToastModule,
    AppFloatingConfigurator,
    LoadingComponent
  ],
  providers: [MessageService]
})
export class CambiarClaveComponent {
  form: FormGroup;
  guardando = false;

  requisitos = [
    { texto: 'Mínimo 8 caracteres', regex: /.{8,}/ },
    { texto: 'Al menos una mayúscula', regex: /[A-Z]/ },
    { texto: 'Al menos una minúscula', regex: /[a-z]/ },
    { texto: 'Al menos un número', regex: /\d/ },
    { texto: 'Al menos un carácter especial (@$!%*?&.#_-)', regex: /[@$!%*?&.#_\-]/ }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private authStateService: AuthStateService,
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {
    this.form = this.fb.group({
      claveActual: ['', Validators.required],
      claveNueva: ['', [Validators.required, claveFortalezaValidator]],
      confirmarClave: ['', Validators.required]
    }, { validators: clavesIgualesValidator });
  }

  cumpleRequisito(requisito: { regex: RegExp }): boolean {
    const valor = this.form.get('claveNueva')?.value ?? '';
    return requisito.regex.test(valor);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.loadingService.show();

    const { claveActual, claveNueva } = this.form.value;

    this.loginService.cambiarClave(claveActual, claveNueva).subscribe({
      next: () => {
        this.guardando = false;
        this.loadingService.hide();
        this.toastService.showSuccess('Contraseña actualizada', 'Tu contraseña fue cambiada exitosamente');
        const destino = this.authStateService.userRoles().length > 1 ? '/auth/select-role' : '/home';
        setTimeout(() => this.router.navigate([destino]), 1500);
      },
      error: (err: any) => {
        this.guardando = false;
        this.loadingService.hide();
        this.toastService.showError('Error', err?.message ?? 'No se pudo actualizar la contraseña');
      }
    });
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && c.touched);
  }
}
