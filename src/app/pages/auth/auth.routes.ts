import { Routes } from '@angular/router';
import { Access } from './access';
import { LoginComponent } from './login/login';
import { Error } from './error';
import { CambiarClaveComponent } from './cambiar-clave/cambiar-clave';
import { SelectRoleComponent } from './select-role/select-role';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: LoginComponent },
    { path: 'cambiar-clave', component: CambiarClaveComponent },
    { path: 'select-role', component: SelectRoleComponent }
] as Routes;
