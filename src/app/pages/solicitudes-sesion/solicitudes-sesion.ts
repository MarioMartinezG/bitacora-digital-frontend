import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { TutorService } from '../../core/services/tutor.service';
import { ToastService } from '../../core/services/toast.service';
import { SolicitudSesionResponse } from '../../core/models/tutor.model';
import { SolicitudSesionDialog } from '../../shared/components/solicitud-sesion-dialog/solicitud-sesion-dialog';

interface FiltroOpcion {
    label: string;
    value: string | null;
}

@Component({
    standalone: true,
    selector: 'app-solicitudes-sesion',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        CardModule,
        TagModule,
        DividerModule,
        SkeletonModule,
        SelectButtonModule,
        PaginatorModule,
        ConfirmDialogModule,
        TooltipModule,
        SolicitudSesionDialog
    ],
    providers: [ConfirmationService],
    templateUrl: './solicitudes-sesion.html',
    styleUrl: './solicitudes-sesion.scss'
})
export class SolicitudesSesion implements OnInit {
    private tutorService = inject(TutorService);
    private confirmationService = inject(ConfirmationService);
    private toastService = inject(ToastService);

    // Estado
    solicitudes = signal<SolicitudSesionResponse[]>([]);
    cargando = signal(true);
    filtroEstado = signal<string | null>(null);

    // Estado del dialogo de nueva solicitud
    showSolicitudDialog = signal(false);

    // Paginacion
    paginaActual = signal(0);
    itemsPorPagina = signal(10);

    // Opciones de filtro
    opcionesFiltro: FiltroOpcion[] = [
        { label: 'Todas', value: null },
        { label: 'Pendientes', value: 'PENDIENTE' },
        { label: 'Aceptadas', value: 'ACEPTADA' },
        { label: 'Rechazadas', value: 'RECHAZADA' }
    ];

    // Skeleton items
    skeletonItems = [1, 2, 3, 4, 5];

    // Computed: solicitudes filtradas
    solicitudesFiltradas = computed(() => {
        const estado = this.filtroEstado();
        if (!estado) return this.solicitudes();
        return this.solicitudes().filter(s => s.estado === estado);
    });

    // Total de items filtrados
    totalFiltrados = computed(() => this.solicitudesFiltradas().length);

    // Solicitudes paginadas
    solicitudesPaginadas = computed(() => {
        const inicio = this.paginaActual() * this.itemsPorPagina();
        const fin = inicio + this.itemsPorPagina();
        return this.solicitudesFiltradas().slice(inicio, fin);
    });

    // Conteo por estado
    conteoPendientes = computed(() => this.solicitudes().filter(s => s.estado === 'PENDIENTE').length);

    ngOnInit(): void {
        this.cargarSolicitudes();
    }

    cargarSolicitudes(): void {
        this.cargando.set(true);
        this.tutorService.obtenerSolicitudesSesion().subscribe({
            next: (data) => {
                // Ordenar por fecha de solicitud, mas recientes primero
                const ordenadas = data.sort((a, b) =>
                    new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
                );
                this.solicitudes.set(ordenadas);
                this.cargando.set(false);
            },
            error: () => {
                this.cargando.set(false);
                this.toastService.showError('Error', 'No se pudieron cargar las solicitudes');
            }
        });
    }

    confirmarEliminar(solicitud: SolicitudSesionResponse): void {
        this.confirmationService.confirm({
            message: '¿Estas seguro de eliminar esta solicitud?',
            header: 'Confirmar eliminacion',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Si, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.eliminarSolicitud(solicitud.id)
        });
    }

    eliminarSolicitud(id: number): void {
        this.tutorService.eliminarSolicitudSesion(id).subscribe({
            next: () => {
                this.solicitudes.update(list => list.filter(s => s.id !== id));
                this.toastService.showSuccess('Eliminada', 'La solicitud ha sido eliminada');
            },
            error: (error) => {
                this.toastService.showError('Error', error?.error?.message || 'No se pudo eliminar la solicitud');
            }
        });
    }

    getSeverity(estado: string): 'warn' | 'success' | 'danger' | 'info' {
        const map: Record<string, 'warn' | 'success' | 'danger' | 'info'> = {
            'PENDIENTE': 'warn',
            'ACEPTADA': 'success',
            'RECHAZADA': 'danger'
        };
        return map[estado] || 'info';
    }

    getEstadoLabel(estado: string): string {
        const labels: Record<string, string> = {
            'PENDIENTE': 'Pendiente',
            'ACEPTADA': 'Aceptada',
            'RECHAZADA': 'Rechazada'
        };
        return labels[estado] || estado;
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleString('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    onCambioFiltro(): void {
        // Reset pagina al cambiar filtros
        this.paginaActual.set(0);
    }

    onCambiarPagina(event: PaginatorState): void {
        this.paginaActual.set(event.page ?? 0);
        this.itemsPorPagina.set(event.rows ?? 10);
    }

    // Callback cuando se crea una nueva solicitud desde el dialogo
    onSolicitudCreada(solicitud: SolicitudSesionResponse): void {
        this.solicitudes.update(list => [solicitud, ...list]);
    }
}
