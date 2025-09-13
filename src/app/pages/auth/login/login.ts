import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';

//Servicios
import { LoginService } from '../../../core/services/login-service';



@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, RouterModule, RippleModule, AppFloatingConfigurator],
  templateUrl: 'login.html',
})
export class Login {
  loginForm: FormGroup;

  private constructor(
    private loginService: LoginService,
    private fb: FormBuilder
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      this.loginService.login(username, password);

      console.log('Autenticado con: ', username, password);
    }
  }

  /*
  username: string = '';

  password: string = '';

  checked: boolean = false;
  */
}
