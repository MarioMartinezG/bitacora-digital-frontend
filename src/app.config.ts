import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';

import Aura from '@primeuix/themes/aura';

import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';

import { appRoutes } from './app.routes';
import { AppConfigService } from './app/core/services/app-config.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideAppInitializer(() => {
            const appConfigService = inject(AppConfigService);
            // 👇 aquí devolvemos directamente la promesa
            return appConfigService.loadConfig();
        }),
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideAnimationsAsync(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        AppConfigService,
        MessageService
    ]
};
