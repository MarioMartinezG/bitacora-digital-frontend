import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { BlockUIModule } from 'primeng/blockui';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

// Componentes
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { LoadingComponent } from '../../../utils/loading/loading';

// Servicios
import { LoginService, LoadingService, ToastService } from '../../../core/services';
import { LoginRequest } from '../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    RouterModule,
    RippleModule,
    BlockUIModule,
    ToastModule,
    DialogModule,
    AppFloatingConfigurator,
    LoadingComponent
  ],
  templateUrl: 'login.html',
  styleUrl: 'login.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  recuperarForm: FormGroup;

  dialogRecuperar = signal(false);
  enviandoRecuperacion = signal(false);
  recuperacionEnviada = signal(false);

  private constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private loadingService: LoadingService,
    private toastService: ToastService,
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.recuperarForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loadingService.show();
      const loginData: LoginRequest = {
        usuario: this.loginForm.value.username,
        contrasena: this.loginForm.value.password
      };

      this.loginService.login(loginData).subscribe({
        next: (response) => {
          this.loadingService.hide();
          if (response.requiere_cambio_clave) {
            this.router.navigate(['/auth/cambiar-clave']);
          } else if (response.user.roles && response.user.roles.length > 1) {
            this.router.navigate(['/auth/select-role']);
          } else {
            this.router.navigate(['home']);
          }
        },
        error: (err) => {
          this.loadingService.hide();
          this.toastService.showError('Error de autenticación', err.message);
          console.error('Error en login:', err.message, 'Código:', err.error);
        }
      });
    }
  }

  abrirRecuperacion(): void {
    this.recuperarForm.reset();
    this.recuperacionEnviada.set(false);
    this.dialogRecuperar.set(true);
  }

  cerrarRecuperacion(): void {
    this.dialogRecuperar.set(false);
  }

  enviarRecuperacion(): void {
    if (this.recuperarForm.invalid) {
      this.recuperarForm.markAllAsTouched();
      return;
    }

    this.enviandoRecuperacion.set(true);
    const { correo } = this.recuperarForm.value;

    this.loginService.recuperarClave(correo).subscribe({
      next: () => {
        this.enviandoRecuperacion.set(false);
        this.recuperacionEnviada.set(true);
      },
      error: () => {
        this.enviandoRecuperacion.set(false);
        // Mostramos el mismo mensaje de éxito para no revelar si el correo existe
        this.recuperacionEnviada.set(true);
      }
    });
  }

  isCorreoInvalid(): boolean {
    const c = this.recuperarForm.get('correo');
    return !!(c && c.invalid && c.touched);
  }
}
