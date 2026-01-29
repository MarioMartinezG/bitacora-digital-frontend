import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { NotificationService } from '../../../../core/services/notification.service';
import { Notificacion, TIPO_ICONO, PRIORIDAD_COLOR_CLASS, PrioridadNotificacion } from '../../../../core/models';

@Component({
    standalone: true,
    selector: 'app-notifications-widget',
    imports: [CommonModule, ButtonModule, BadgeModule, RippleModule, TooltipModule, SkeletonModule, DividerModule],
    templateUrl: './notificationswidget.html',
    styleUrl: './notificationswidget.scss'
})
export class NotificationsWidget implements OnInit {
    private notificationService = inject(NotificationService);
    private router = inject(Router);

    // Signals del servicio
    notificaciones = this.notificationService.notificaciones;
    conteoNoLeidas = this.notificationService.conteoNoLeidas;
    cargando = this.notificationService.cargando;

    // Contadores calculados localmente desde el array de notificaciones
    contadorCriticas = computed(() => this.contarPorPrioridad('CRITICO'));
    contadorAlertas = computed(() => this.contarPorPrioridad('ALERTA'));
    contadorInfo = computed(() => this.contarPorPrioridad('INFO'));
    contadorSuccess = computed(() => this.contarPorPrioridad('SUCCESS'));

    // Skeleton items para loader
    skeletonItems = [1, 2, 3, 4, 5];

    // Máximo de notificaciones a mostrar en el widget
    readonly maxItems = 5;

    ngOnInit(): void {
        // Si no hay notificaciones cargadas, cargarlas
        if (this.notificaciones().length === 0) {
            this.notificationService.cargarNotificaciones().subscribe();
        }
    }

    private contarPorPrioridad(prioridad: PrioridadNotificacion): number {
        return this.notificaciones().filter((n) => n.prioridad === prioridad).length;
    }

    get notificacionesRecientes(): Notificacion[] {
        return this.notificaciones().slice(0, this.maxItems);
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

        if (diffMin < 1) return 'Ahora';
        if (diffMin < 60) return `${diffMin}min`;
        if (diffHoras < 24) return `${diffHoras}h`;
        if (diffDias < 7) return `${diffDias}d`;
        return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }

    onRefrescar(): void {
        this.notificationService.cargarNotificaciones().subscribe();
    }

    onClickNotificacion(notificacion: Notificacion): void {
        if (!notificacion.leida) {
            this.notificationService.marcarComoLeida(notificacion.id).subscribe();
        }
    }

    onVerTodas(): void {
        this.router.navigate(['/home/notificaciones']);
    }
}
