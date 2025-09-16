import { Injectable } from '@angular/core';
import { delay, Observable, of, switchMap, throwError, timer } from 'rxjs';
import { AuthSuccessResponse, AuthErrorResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private isLoggedIn = false;

  // TODO - Eliminar mock cuando se implemente el back
  private mockUsers: { [key: string]: { password: string; role: string } } = {
    'daniela.murcia': { password: '123456', role: 'estudiante' },
    'guiovanna.sabogal': { password: '123456', role: 'tutor' },
    'carmen.vargas': { password: '123456', role: 'estudiante' }
  }

  login(username: string, password: string): Observable<AuthSuccessResponse> {
    // TODO - Implementar servicio de backend y retirar lógica del mock
    // Para el mock, se busca el usuario dentro de los generados
    const user = this.mockUsers[username];

    if (user && user.password === password) {
      this.isLoggedIn = true;

      // Se simula el objeto de respuesta exitoso del backend
      const response: AuthSuccessResponse = {
        message: 'Login successful',
        access_token: 'fake-jwt-access-token-' + Math.random().toString(36).substring(2),
        refresh_token: 'fake-jwt-refresh-token-' + Math.random().toString(36).substring(2),
        expires_in: 3600,
        user: {
          id: 'user-' + username,
          username,
          role: user.role
        }
      };

      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('expires_in', response.expires_in.toString());
      localStorage.setItem('user', JSON.stringify(response.user));

      // Se emula el envio de respuesta del back con delay de 1 segundo
      return of(response).pipe(delay(2000));

    }

    // Se simula el objeto de respuesta de error 401 del backend
    const error: AuthErrorResponse = {
      message: 'Credenciales inválidas',
      error_code: 'INVALID_CREDENTIALS'
    };
    // Simulación de error con retraso
    return timer(1000).pipe(
      switchMap(() => throwError(() => error))
    );
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

}
