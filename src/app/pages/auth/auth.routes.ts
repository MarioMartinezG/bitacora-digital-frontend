import { Routes } from '@angular/router';
import { Access } from './access';
import { LoginComponent } from './login/login';
import { Error } from './error';
import { CambiarClaveComponent } from './cambiar-clave/cambiar-clave';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: LoginComponent },
    { path: 'cambiar-clave', component: CambiarClaveComponent }
] as Routes;
