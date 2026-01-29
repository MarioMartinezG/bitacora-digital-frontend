import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { LoginService } from '../../../core/services/login.service';

interface UserData {
    id: number;
    username: string;
    role: number;
    nombre: string;
    correo: string;
}

@Component({
    selector: 'app-user-menu',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, DividerModule],
    templateUrl: './user-menu.html',
    styleUrl: './user-menu.scss',
    host: {
        class: 'hidden absolute top-13 right-0 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]'
    }
})
export class UserMenu {
    private loginService = inject(LoginService);
    private router = inject(Router);

    get userData(): UserData | null {
        const userStr = this.loginService.getUser();
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    }

    get userInitials(): string {
        const user = this.userData;
        if (user?.nombre) {
            const parts = user.nombre.split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return user.nombre.substring(0, 2).toUpperCase();
        }
        return 'US';
    }

    onLogout(): void {
        this.loginService.logout().subscribe({
            next: () => {
                this.router.navigate(['/auth/login']);
            },
            error: () => {
                this.router.navigate(['/auth/login']);
            }
        });
    }
}
