import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { LoginService } from '../../../core/services/login.service';
import { UserRole, ROLE_LABELS } from '../../../core/models/role.model';

interface RoleOption {
  id: UserRole;
  label: string;
  icon: string;
  description: string;
}

const ROLE_META: Record<UserRole, { icon: string; description: string }> = {
  [UserRole.ESTUDIANTE]: {
    icon: 'pi pi-user',
    description: 'Accede a tu bitácora y sigue tu progreso en el curso'
  },
  [UserRole.TUTOR]: {
    icon: 'pi pi-book',
    description: 'Revisa y retroalimenta las bitácoras de tus estudiantes'
  },
  [UserRole.COORDINADOR]: {
    icon: 'pi pi-cog',
    description: 'Gestiona usuarios, cursos y configuración general'
  }
};

@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [CommonModule, ButtonModule, AppFloatingConfigurator],
  templateUrl: 'select-role.html',
  styleUrl: 'select-role.scss',
})
export class SelectRoleComponent implements OnInit {
  private authState = inject(AuthStateService);
  private loginService = inject(LoginService);
  private router = inject(Router);

  roles: RoleOption[] = [];

  ngOnInit(): void {
    const userRoles = this.authState.userRoles();

    if (userRoles.length === 0) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (userRoles.length === 1) {
      this.authState.setActiveRole(userRoles[0] as UserRole);
      this.router.navigate(['home']);
      return;
    }

    this.roles = userRoles.map(r => {
      const roleId = r as UserRole;
      const meta = ROLE_META[roleId] ?? { icon: 'pi pi-user', description: '' };
      return {
        id: roleId,
        label: ROLE_LABELS[roleId] ?? String(r),
        icon: meta.icon,
        description: meta.description
      };
    });
  }

  selectRole(role: UserRole): void {
    this.authState.setActiveRole(role);
    this.router.navigate(['home']);
  }

  logout(): void {
    this.loginService.clearAuthData();
    this.router.navigate(['/auth/login']);
  }
}
