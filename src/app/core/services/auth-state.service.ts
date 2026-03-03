import { Injectable, signal, computed } from '@angular/core';
import { User, normalizeUserRoles } from '../models';
import { UserRole } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private userSignal = signal<User | null>(null);

  user = this.userSignal.asReadonly();

  isAuthenticated = computed(() => this.userSignal() !== null);

  userRoles = computed(() => this.userSignal()?.roles ?? []);

  primaryRole = computed(() => {
    const roles = this.userRoles();
    return roles.length > 0 ? roles[0] : null;
  });

  isEstudiante = computed(() => this.userRoles().includes(UserRole.ESTUDIANTE));
  isTutor = computed(() => this.userRoles().includes(UserRole.TUTOR));
  isCoordinador = computed(() => this.userRoles().includes(UserRole.COORDINADOR));

  hasRole(role: UserRole): boolean {
    return this.userRoles().includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRoles = this.userRoles();
    return roles.some(role => userRoles.includes(role));
  }

  setUser(userData: User | null): void {
    if (userData) {
      this.userSignal.set(normalizeUserRoles(userData));
    } else {
      this.userSignal.set(null);
    }
  }

  clearUser(): void {
    this.userSignal.set(null);
  }

  getUserData(): User | null {
    return this.userSignal();
  }
}
