import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { BlockUIModule } from 'primeng/blockui';
import { ToastModule } from 'primeng/toast';

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
    AppFloatingConfigurator,
    LoadingComponent],
  templateUrl: 'login.html',
})
export class LoginComponent {
  loginForm: FormGroup;

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
  }

  login(): void {
    if (this.loginForm.valid) {
      this.loadingService.show();
      const loginData: LoginRequest = {
        usuario: this.loginForm.value.username,
        contrasena: this.loginForm.value.password
      }

      this.loginService.login(loginData).subscribe({
        next: (response) => {
          this.loadingService.hide();

          console.log('Autenticado', response);
          this.router.navigate(['home']);
        },
        error: (err) => {
          this.loadingService.hide();
          this.toastService.showError('Error de autenticación', err.message);
          console.error('Error en login:', err.message, 'Código:', err.error);
        }
      });
    }
  }
}
