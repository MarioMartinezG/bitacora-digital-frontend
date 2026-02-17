import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../services/login.service';

export const authGuard: CanActivateFn = (route, state) => {
    const loginService = inject(LoginService);
    const router = inject(Router);

    const token = loginService.getToken();
    if (!token) {
        router.navigate(['/auth/login']);
        return false;
    }

    const requiredRoles = route.data?.['roles'] as number[] | undefined;
    if (requiredRoles) {
        const userData = loginService.getUser();
        if (!userData) {
            router.navigate(['/auth/login']);
            return false;
        }
        const user = JSON.parse(userData);
        if (!requiredRoles.includes(user.role)) {
            router.navigate(['/notfound']);
            return false;
        }
    }

    return true;
};
