import { Component, inject, OnInit, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { NotificationService } from '../../../core/services/notification.service';
import { Notificacion, TIPO_ICONO, PRIORIDAD_COLOR_CLASS } from '../../../core/models';

@Component({
    selector: 'app-notification-panel',
    standalone: true,
    imports: [CommonModule, ButtonModule, BadgeModule, RippleModule, TooltipModule, SkeletonModule, DividerModule],
    templateUrl: './notification-panel.html',
    styleUrl: './notification-panel.scss',
    host: {
        class: 'hidden absolute top-13 right-0 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]'
    }
})
export class NotificationPanel implements OnInit {
    private notificationService = inject(NotificationService);

    // Output para navegacion
    verTodas = output<void>();

    // Signals del servicio
    notificaciones = this.notificationService.notificaciones;
    conteoNoLeidas = this.notificationService.conteoNoLeidas;
    cargando = this.notificationService.cargando;

    // Items para skeleton loader
    skeletonItems = [1, 2, 3];

    ngOnInit(): void {
        this.notificationService.cargarNotificaciones().subscribe();
    }

    getIconClass(tipo: string): string {
        return TIPO_ICONO[tipo as keyof typeof TIPO_ICONO] || 'pi-bell';
    }

    getIconBgClass(prioridad: string): string {
        return PRIORIDAD_COLOR_CLASS[prioridad as keyof typeof PRIORIDAD_COLOR_CLASS] || PRIORIDAD_COLOR_CLASS['INFO'];
    }

    calcularTiempoRelativo(fechaCreacion: string): string {
        const fecha = new Date(fechaCreacion);
        const ahora = new Date();
        const diffMs = ahora.getTime() - fecha.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMin / 60);
        const diffDias = Math.floor(diffHoras / 24);

        if (diffMin < 1) return 'Ahora mismo';
        if (diffMin < 60) return `Hace ${diffMin} min`;
        if (diffHoras < 24) return `Hace ${diffHoras} h`;
        if (diffDias < 7) return `Hace ${diffDias} dias`;
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    onClickNotificacion(notificacion: Notificacion): void {
        if (!notificacion.leida) {
            this.notificationService.marcarComoLeida(notificacion.id).subscribe();
        }
    }

    onMarcarLeida(event: Event, notificacion: Notificacion): void {
        event.stopPropagation();
        this.notificationService.marcarComoLeida(notificacion.id).subscribe();
    }

    onMarcarTodasLeidas(): void {
        this.notificationService.marcarTodasComoLeidas().subscribe();
    }

    onEliminar(event: Event, notificacion: Notificacion): void {
        event.stopPropagation();
        this.notificationService.eliminarNotificacion(notificacion.id).subscribe();
    }
}
