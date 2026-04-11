import { Injectable, signal, computed } from '@angular/core';
import { User, normalizeUserRoles } from '../models';
import { UserRole } from '../models/role.model';

const ACTIVE_ROLE_KEY = 'active_role';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private userSignal = signal<User | null>(null);
  private activeRoleSignal = signal<UserRole | null>(null);

  user = this.userSignal.asReadonly();
  activeRole = this.activeRoleSignal.asReadonly();

  isAuthenticated = computed(() => this.userSignal() !== null);

  userRoles = computed(() => this.userSignal()?.roles ?? []);

  primaryRole = computed(() => {
    const roles = this.userRoles();
    return roles.length > 0 ? roles[0] : null;
  });

  /** Rol activo seleccionado por el usuario; si no eligió, usa el primero disponible. */
  effectiveRole = computed(() => this.activeRoleSignal() ?? this.primaryRole());

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
      const normalized = normalizeUserRoles(userData);
      this.userSignal.set(normalized);

      if (normalized.roles.length === 1) {
        // Un solo rol: establecerlo como activo automáticamente
        this.setActiveRole(normalized.roles[0] as UserRole);
      } else {
        // Múltiples roles: restaurar selección previa si existe
        const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
        if (stored) {
          this.activeRoleSignal.set(Number(stored) as UserRole);
        }
      }
    } else {
      this.userSignal.set(null);
    }
  }

  setActiveRole(role: UserRole): void {
    this.activeRoleSignal.set(role);
    localStorage.setItem(ACTIVE_ROLE_KEY, String(role));
  }

  clearUser(): void {
    this.userSignal.set(null);
    this.activeRoleSignal.set(null);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
  }

  getUserData(): User | null {
    return this.userSignal();
  }
}
