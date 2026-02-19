import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { AppConfigurator } from './app.configurator';
import { NotificationPanel } from './notification-panel/notification-panel';
import { UserMenu } from './user-menu/user-menu';
import { LayoutService } from '../service/layout.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, OverlayBadgeModule, AppConfigurator, NotificationPanel, UserMenu],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <span class="layout-topbar-logo" style="display: flex; align-items: center; gap: 0.5rem; cursor: default;">
                <img src="ueb-escudo.jpg" alt="Escudo UEB" style="height: 2.5rem; width: auto; object-fit: contain;">
                <span>Bitácora Digital</span>
            </span>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <div class="relative">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <div class="relative">
                        <button
                            type="button"
                            class="layout-topbar-action"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                        >
                            <p-overlaybadge [value]="conteoNoLeidas() > 0 ? conteoNoLeidas().toString() : null" [severity]="tieneCriticas() ? 'danger' : 'info'">
                                <i class="pi pi-bell"></i>
                            </p-overlaybadge>
                            <span>Notificaciones</span>
                        </button>
                        <app-notification-panel (verTodas)="onVerTodasNotificaciones()" />
                    </div>
                    <div class="relative">
                        <button
                            type="button"
                            class="layout-topbar-action"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                        >
                            <i class="pi pi-user"></i>
                            <span>Perfil</span>
                        </button>
                        <app-user-menu />
                    </div>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];

    layoutService = inject(LayoutService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    // Signals del servicio de notificaciones
    conteoNoLeidas = this.notificationService.conteoNoLeidas;
    tieneCriticas = this.notificationService.tieneCriticas;

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    onVerTodasNotificaciones() {
        this.router.navigate(['/home/notificaciones']);
    }
}
