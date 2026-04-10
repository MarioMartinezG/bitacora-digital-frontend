import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../services/login.service';
import { AuthStateService } from '../services/auth-state.service';

export const authGuard: CanActivateFn = (route, state) => {
    const loginService = inject(LoginService);
    const authStateService = inject(AuthStateService);
    const router = inject(Router);

    const token = loginService.getToken();
    if (!token) {
        router.navigate(['/auth/login']);
        return false;
    }

    const requiredRoles = route.data?.['roles'] as number[] | undefined;
    if (requiredRoles && requiredRoles.length > 0) {
        const user = authStateService.getUserData();

        if (!user) {
            router.navigate(['/auth/login']);
            return false;
        }

        const userRoles = user.roles ?? (user.role ? [user.role] : []);
        const hasAccess = requiredRoles.some(role => userRoles.includes(role));

        if (!hasAccess) {
            router.navigate(['/notfound']);
            return false;
        }
    }

    return true;
};
