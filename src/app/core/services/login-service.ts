import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private isLoggedIn = false;

  login(username: string, password: string): boolean {
    // Lógica temporal hasta que tengas backend
    if (username && password) {
      this.isLoggedIn = true;
      localStorage.setItem('token', 'fake-token');
      return true;
    }
    return false;
  }

  logout(): void {
    this.isLoggedIn = false;
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
  
}
