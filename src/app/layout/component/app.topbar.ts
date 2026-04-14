import { Component, inject, computed } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { DialogModule } from 'primeng/dialog';
import { UserRole } from '../../core/models/role.model';
import { AppConfigurator } from './app.configurator';
import { NotificationPanel } from './notification-panel/notification-panel';
import { UserMenu } from './user-menu/user-menu';
import { LayoutService } from '../service/layout.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthStateService } from '../../core/services/auth-state.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, OverlayBadgeModule, DialogModule, AppConfigurator, NotificationPanel, UserMenu],
    template: ` <div class="layout-topbar">
        <div class="layout-topbar-logo-container" style="flex: 1; min-width: 0; display: flex; align-items: center;">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <span class="layout-topbar-logo" style="display: flex; align-items: center; gap: 0.5rem; cursor: default; min-width: 0;">
                <img src="ueb-escudo.jpg" alt="Escudo UEB" style="height: 2.5rem; width: auto; object-fit: contain; flex-shrink: 0;">
                <span style="font-size: 1.15rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">TEIA - Tutoría Educativa con Inteligencia Artificial para el desarrollo de la Bitácora Digital</span>
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
                    @if (authStateService.isEstudiante()) {
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
                            <i class="pi pi-book"></i>
                            <span>Medios educativos</span>
                        </button>
                        <div class="hidden absolute right-0 top-full mt-2 w-80 border border-surface rounded-lg shadow-lg p-3" style="z-index: 9999; background-color: var(--surface-card); border-color: var(--surface-border);">
                            <p class="font-semibold text-sm mb-3">Medios educativos</p>
                            @for (recurso of recursos; track recurso.url) {
                            <a
                                [href]="recurso.url"
                                [attr.download]="recurso.nombre"
                                style="display:flex; align-items:center; gap:0.5rem; padding:0.5rem; border-radius:6px; text-decoration:none; color:inherit; cursor:pointer;"
                                onmouseover="this.style.backgroundColor='var(--surface-hover)'"
                                onmouseout="this.style.backgroundColor='transparent'"
                            >
                                <i class="pi pi-file-pdf" style="color: var(--red-500);"></i>
                                <span style="font-size:0.875rem;">{{ recurso.label }}</span>
                            </a>
                            }
                        </div>
                    </div>
                    }
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
                            <i class="pi pi-question-circle"></i>
                            <span>Ayuda</span>
                        </button>
                        <div class="hidden absolute right-0 top-full mt-2 w-56 border border-surface rounded-lg shadow-lg p-3" style="z-index: 9999; background-color: var(--surface-card); border-color: var(--surface-border);">
                            <p class="font-semibold text-sm mb-3">Ayuda</p>
                            @if (manualUsuario()) {
                            <a
                                [href]="manualUsuario()!.url"
                                [attr.download]="manualUsuario()!.nombre"
                                style="display:flex; align-items:center; gap:0.5rem; padding:0.5rem; border-radius:6px; text-decoration:none; color:inherit; cursor:pointer;"
                                onmouseover="this.style.backgroundColor='var(--surface-hover)'"
                                onmouseout="this.style.backgroundColor='transparent'"
                            >
                                <i class="pi pi-download" style="color: var(--primary-color);"></i>
                                <span style="font-size:0.875rem;">Manual de Usuario</span>
                            </a>
                            }
                            <button
                                type="button"
                                (click)="mostrarAcercaDe = true"
                                style="display:flex; align-items:center; gap:0.5rem; padding:0.5rem; border-radius:6px; color:inherit; cursor:pointer; width:100%; border:none; background:transparent; font-family:inherit;"
                                onmouseover="this.style.backgroundColor='var(--surface-hover)'"
                                onmouseout="this.style.backgroundColor='transparent'"
                            >
                                <i class="pi pi-info-circle" style="color: var(--primary-color);"></i>
                                <span style="font-size:0.875rem;">Acerca de</span>
                            </button>
                        </div>
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
    </div>

    <p-dialog
        [(visible)]="mostrarAcercaDe"
        [modal]="true"
        [style]="{ width: '44rem' }"
        [draggable]="false"
        [resizable]="false"
        [showHeader]="false"
    >
        <div style="padding: 0; overflow: hidden; border-radius: 8px;">

            <!-- Header -->
            <div style="padding: 2rem 2rem 1.5rem; text-align: center; border-bottom: 1px solid var(--surface-border); position: relative;">
                <button
                    type="button"
                    (click)="mostrarAcercaDe = false"
                    style="position: absolute; top: 0.75rem; right: 0.75rem; background: transparent; border: none; cursor: pointer; color: var(--text-color-secondary); padding: 0.25rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;"
                    onmouseover="this.style.color='var(--text-color)'; this.style.backgroundColor='var(--surface-hover)'"
                    onmouseout="this.style.color='var(--text-color-secondary)'; this.style.backgroundColor='transparent'"
                >
                    <i class="pi pi-times" style="font-size: 0.9rem;"></i>
                </button>
                <div style="width: 4rem; height: 4rem; background: var(--surface-100, var(--surface-ground)); border: 1px solid var(--surface-border); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem; overflow: hidden;">
                    <img src="/favicon.ico" alt="TEIA" style="width: 2.4rem; height: 2.4rem; object-fit: contain;">
                </div>
                <h2 style="margin: 0 0 0.25rem; font-size: 1.3rem; font-weight: 700; color: var(--text-color); letter-spacing: 0.02em;">TEIA</h2>
                <p style="margin: 0; font-size: 0.8rem; color: var(--text-color-secondary); line-height: 1.5;">
                    Tutoría Educativa con Inteligencia Artificial<br>para el desarrollo de la Bitácora Digital
                </p>
            </div>

            <!-- Descripción -->
            <div style="padding: 1.5rem 2rem 0; text-align: center;">
                <p style="margin: 0; font-size: 0.9rem; color: var(--text-color-secondary); line-height: 1.7;">
                    Trabajo de grado desarrollado en el marco del programa de
                    <strong style="color: var(--text-color);">Ingeniería de Sistemas</strong>
                    de la <strong style="color: var(--text-color);">Universidad El Bosque</strong>.
                </p>
            </div>

            <!-- Créditos -->
            <div style="padding: 1.25rem 2rem 0; display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">

                <div style="background: var(--surface-50, var(--surface-ground)); border: 1px solid var(--surface-border); border-radius: 10px; padding: 1rem 1.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <i class="pi pi-code" style="color: var(--primary-color); font-size: 0.95rem;"></i>
                        <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary-color);">Desarrollo</span>
                    </div>
                    <p style="margin: 0 0 0.35rem; font-size: 0.875rem; color: var(--text-color);">Daniela Valentina Murcia Muñoz</p>
                    <p style="margin: 0; font-size: 0.875rem; color: var(--text-color);">Mario Andrés Martínez García</p>
                </div>

                <div style="background: var(--surface-50, var(--surface-ground)); border: 1px solid var(--surface-border); border-radius: 10px; padding: 1rem 1.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <i class="pi pi-user" style="color: var(--primary-color); font-size: 0.95rem;"></i>
                        <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary-color);">Dirección del proyecto</span>
                    </div>
                    <p style="margin: 0 0 0.35rem; font-size: 0.875rem; color: var(--text-color);">Guiovanna Paola Sabogal Alfaro</p>
                    <p style="margin: 0; font-size: 0.875rem; color: var(--text-color);">Helio Henry Ramírez Arévalo</p>
                </div>

                <div style="background: var(--surface-50, var(--surface-ground)); border: 1px solid var(--surface-border); border-radius: 10px; padding: 1rem 1.25rem; grid-column: 1 / -1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
                        <i class="pi pi-building" style="color: var(--primary-color); font-size: 0.95rem;"></i>
                        <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--primary-color);">Aliado institucional</span>
                    </div>
                    <p style="margin: 0 0 0.2rem; font-size: 0.875rem; color: var(--text-color);">
                        Área de Fortalecimiento Curricular — <strong>DIGINEXA</strong>
                    </p>
                    <p style="margin: 0; font-size: 0.875rem; color: var(--text-color); font-weight: 500;">Coordinadora: Carmen Lucía Vargas Mayo</p>
                </div>

            </div>

            <!-- Footer -->
            <div style="padding: 1.25rem 2rem 1.5rem; text-align: center;">
                <span style="font-size: 0.75rem; color: var(--text-color-secondary);">Universidad El Bosque · 2026</span>
            </div>

        </div>
    </p-dialog>`
})
export class AppTopbar {
    items!: MenuItem[];

    layoutService = inject(LayoutService);
    authStateService = inject(AuthStateService);
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    mostrarAcercaDe = false;

    manualUsuario = computed((): { nombre: string; url: string } | null => {
        const role = this.authStateService.effectiveRole();
        if (role === UserRole.ESTUDIANTE)  return { nombre: 'Manual_Estudiante.pdf',  url: '/assets/recursos/Manual_Estudiante.pdf'  };
        if (role === UserRole.TUTOR)       return { nombre: 'Manual_Tutor.pdf',        url: '/assets/recursos/Manual_Tutor.pdf'        };
        if (role === UserRole.COORDINADOR) return { nombre: 'Manual_Coordinador.pdf',  url: '/assets/recursos/Manual_Coordinador.pdf'  };
        return null;
    });

    recursos = [
        { label: 'Unidad 1 - Punto de Partida', nombre: 'unidad-1-punto-de-partida-2026-1-njCH6iYM.pdf', url: '/assets/recursos/unidad-1-punto-de-partida-2026-1-njCH6iYM.pdf' },
        { label: 'Unidad 2 - Contexto UEB', nombre: 'unidad-2-contexto-ueb-2026-1-_Sm9zuEa.pdf', url: '/assets/recursos/unidad-2-contexto-ueb-2026-1-_Sm9zuEa.pdf' },
        { label: 'Unidad 3 - Diseño de cursos para el Éxito Académico', nombre: 'unidad-3-diseno-de-cursos-para-el-exito-academico-2026-Fg5MjKKg.pdf', url: '/assets/recursos/unidad-3-diseno-de-cursos-para-el-exito-academico-2026-Fg5MjKKg.pdf' },
    ];

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
