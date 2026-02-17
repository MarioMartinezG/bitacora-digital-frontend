import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { NotificationService } from '../../core/services/notification.service';
import { Notificacion, TipoNotificacion, TIPO_ICONO, PRIORIDAD_COLOR_CLASS } from '../../core/models';

interface FiltroOpcion {
    label: string;
    value: string | null;
}

interface DatoAdicionalFormateado {
    label: string;
    valor: string;
    orden: number;
}

// Mapeo de nombres técnicos a nombres amigables para el usuario
const LABELS_DATOS_ADICIONALES: Record<string, string> = {
    // Campos comunes
    estado: 'Estado',
    nombreTutor: 'Tutor',
    nombreEstudiante: 'Estudiante',
    notasTutor: 'Notas del tutor',
    notasEstudiante: 'Notas del estudiante',
    motivoRechazo: 'Motivo del rechazo',

    // Fechas
    fechaCreacion: 'Fecha de creacion',
    fechaLectura: 'Fecha de lectura',
    fechaSesion: 'Fecha de la sesion',
    fechaVencimiento: 'Fecha de vencimiento',

    // Bitacora
    nombreBitacora: 'Bitacora',
    moduloNombre: 'Modulo',
    diasRestantes: 'Dias restantes',

    // Umbrales
    umbralAlcanzado: 'Umbral alcanzado',
    valorActual: 'Valor actual',
    valorLimite: 'Valor limite',

    // Sesiones
    tituloSesion: 'Titulo de la sesion',
    descripcionSesion: 'Descripcion'
};

// Campos que no se deben mostrar al usuario (IDs internos)
const CAMPOS_OCULTOS = ['tutorId', 'estudianteId', 'solicitudId', 'bitacoraId', 'moduloId', 'sesionId', 'usuarioId'];

// Orden de prioridad para mostrar los campos
const ORDEN_CAMPOS: Record<string, number> = {
    estado: 1,
    nombreTutor: 2,
    nombreEstudiante: 3,
    fechaCreacion: 4,
    fechaLectura: 5,
    fechaSesion: 6,
    notasTutor: 7,
    notasEstudiante: 8,
    motivoRechazo: 9,
    nombreBitacora: 10,
    moduloNombre: 11,
    fechaVencimiento: 12,
    diasRestantes: 13
};

@Component({
    standalone: true,
    selector: 'app-notificaciones',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        BadgeModule,
        RippleModule,
        TooltipModule,
        SkeletonModule,
        DividerModule,
        SelectModule,
        PaginatorModule,
        TagModule,
        ConfirmDialogModule
    ],
    providers: [ConfirmationService],
    templateUrl: './notificaciones.html',
    styleUrl: './notificaciones.scss'
})
export class Notificaciones implements OnInit {
    private notificationService = inject(NotificationService);
    private confirmationService = inject(ConfirmationService);

    // Signals del servicio
    notificaciones = this.notificationService.notificaciones;
    conteoNoLeidas = this.notificationService.conteoNoLeidas;
    cargando = this.notificationService.cargando;

    // Filtros
    filtroTipo = signal<string | null>(null);
    filtroEstado = signal<string | null>(null);

    // Paginacion
    paginaActual = signal(0);
    itemsPorPagina = signal(10);

    // Opciones de filtros
    opcionesTipo: FiltroOpcion[] = [
        { label: 'Todos los tipos', value: null },
        { label: 'Solicitud de sesion', value: 'SOLICITUD_SESION' },
        { label: 'Respuesta solicitud', value: 'RESPUESTA_SOLICITUD' },
        { label: 'Vencimiento proximo', value: 'VENCIMIENTO_PROXIMO' },
        { label: 'Umbral alcanzado', value: 'UMBRAL_ALCANZADO' }
    ];

    opcionesEstado: FiltroOpcion[] = [
        { label: 'Todas', value: null },
        { label: 'No leidas', value: 'NO_LEIDAS' },
        { label: 'Leidas', value: 'LEIDAS' }
    ];

    // Skeleton items
    skeletonItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Notificaciones filtradas
    notificacionesFiltradas = computed(() => {
        let lista = this.notificaciones();

        // Filtrar por tipo
        const tipo = this.filtroTipo();
        if (tipo) {
            lista = lista.filter((n) => n.tipo === tipo);
        }

        // Filtrar por estado
        const estado = this.filtroEstado();
        if (estado === 'NO_LEIDAS') {
            lista = lista.filter((n) => !n.leida);
        } else if (estado === 'LEIDAS') {
            lista = lista.filter((n) => n.leida);
        }

        return lista;
    });

    // Total de items filtrados
    totalFiltrados = computed(() => this.notificacionesFiltradas().length);

    // Notificaciones paginadas
    notificacionesPaginadas = computed(() => {
        const inicio = this.paginaActual() * this.itemsPorPagina();
        const fin = inicio + this.itemsPorPagina();
        return this.notificacionesFiltradas().slice(inicio, fin);
    });

    ngOnInit(): void {
        this.notificationService.cargarNotificaciones().subscribe();
    }

    getIconClass(tipo: string): string {
        return TIPO_ICONO[tipo as keyof typeof TIPO_ICONO] || 'pi-bell';
    }

    getIconBgClass(prioridad: string): string {
        return PRIORIDAD_COLOR_CLASS[prioridad as keyof typeof PRIORIDAD_COLOR_CLASS] || PRIORIDAD_COLOR_CLASS['INFO'];
    }

    getTipoLabel(tipo: TipoNotificacion): string {
        const labels: Record<TipoNotificacion, string> = {
            SOLICITUD_SESION: 'Solicitud',
            RESPUESTA_SOLICITUD: 'Respuesta',
            VENCIMIENTO_PROXIMO: 'Vencimiento',
            UMBRAL_ALCANZADO: 'Umbral',
            COMENTARIO_TUTOR: 'Comentario',
            ESTADO_TUTOR_ACTUALIZADO: 'Estado actualizado'
        };
        return labels[tipo] || tipo;
    }

    getPrioridadSeverity(prioridad: string): 'danger' | 'warn' | 'info' | 'success' | 'secondary' {
        const severities: Record<string, 'danger' | 'warn' | 'info' | 'success'> = {
            CRITICO: 'danger',
            ALERTA: 'warn',
            INFO: 'info',
            SUCCESS: 'success'
        };
        return severities[prioridad] || 'secondary';
    }

    formatearFecha(fechaCreacion: string): string {
        const fecha = new Date(fechaCreacion);
        const ahora = new Date();
        const diffMs = ahora.getTime() - fecha.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffHoras = Math.floor(diffMin / 60);
        const diffDias = Math.floor(diffHoras / 24);

        if (diffMin < 1) return 'Ahora mismo';
        if (diffMin < 60) return `Hace ${diffMin} minutos`;
        if (diffHoras < 24) return `Hace ${diffHoras} horas`;
        if (diffDias < 7) return `Hace ${diffDias} dias`;

        return fecha.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    onRefrescar(): void {
        this.notificationService.cargarNotificaciones().subscribe();
    }

    onMarcarTodasLeidas(): void {
        this.confirmationService.confirm({
            message: 'Esto marcara todas las notificaciones como leidas. ¿Desea continuar?',
            header: 'Confirmar accion',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Si, marcar todas',
            rejectLabel: 'Cancelar',
            accept: () => {
                this.notificationService.marcarTodasComoLeidas().subscribe();
            }
        });
    }

    onMarcarLeida(event: Event, notificacion: Notificacion): void {
        event.stopPropagation();
        this.notificationService.marcarComoLeida(notificacion.id).subscribe();
    }

    onEliminar(event: Event, notificacion: Notificacion): void {
        event.stopPropagation();
        this.confirmationService.confirm({
            message: `¿Desea eliminar la notificacion "${notificacion.titulo}"?`,
            header: 'Confirmar eliminacion',
            icon: 'pi pi-trash',
            acceptLabel: 'Si, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.notificationService.eliminarNotificacion(notificacion.id).subscribe();
            }
        });
    }

    onClickNotificacion(notificacion: Notificacion): void {
        if (!notificacion.leida) {
            this.notificationService.marcarComoLeida(notificacion.id).subscribe();
        }
    }

    onCambiarPagina(event: PaginatorState): void {
        this.paginaActual.set(event.page ?? 0);
        this.itemsPorPagina.set(event.rows ?? 10);
    }

    onCambioFiltro(): void {
        // Reset pagina al cambiar filtros
        this.paginaActual.set(0);
    }

    getDatosAdicionalesFormateados(notificacion: Notificacion): DatoAdicionalFormateado[] {
        const resultado: DatoAdicionalFormateado[] = [];

        // Agregar fechaCreacion y fechaLectura del nivel raíz
        if (notificacion.fechaCreacion) {
            resultado.push({
                label: LABELS_DATOS_ADICIONALES['fechaCreacion'],
                valor: this.formatearFechaCompleta(notificacion.fechaCreacion),
                orden: ORDEN_CAMPOS['fechaCreacion']
            });
        }

        if (notificacion.fechaLectura) {
            resultado.push({
                label: LABELS_DATOS_ADICIONALES['fechaLectura'],
                valor: this.formatearFechaCompleta(notificacion.fechaLectura),
                orden: ORDEN_CAMPOS['fechaLectura']
            });
        }

        // Agregar datos adicionales si existen
        if (notificacion.datosAdicionales) {
            Object.entries(notificacion.datosAdicionales)
                .filter(([key]) => !CAMPOS_OCULTOS.includes(key))
                .forEach(([key, value]) => {
                    resultado.push({
                        label: LABELS_DATOS_ADICIONALES[key] || this.formatearNombreCampo(key),
                        valor: this.formatearValor(key, value),
                        orden: ORDEN_CAMPOS[key] || 100
                    });
                });
        }

        return resultado.sort((a, b) => a.orden - b.orden);
    }

    private formatearNombreCampo(key: string): string {
        // Convierte camelCase a texto legible: "nombreTutor" -> "Nombre tutor"
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }

    private formatearValor(key: string, value: unknown): string {
        if (value === null || value === undefined) return '-';

        // Formatear fechas
        if (key.toLowerCase().includes('fecha') && typeof value === 'string') {
            return this.formatearFechaCompleta(value);
        }

        // Formatear estados
        if (key === 'estado' && typeof value === 'string') {
            return this.formatearEstado(value);
        }

        // Formatear dias restantes
        if (key === 'diasRestantes' && typeof value === 'number') {
            if (value === 0) return 'Hoy';
            if (value === 1) return '1 dia';
            return `${value} dias`;
        }

        return String(value);
    }

    private formatearFechaCompleta(fechaStr: string): string {
        try {
            const fecha = new Date(fechaStr);
            return fecha.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return fechaStr;
        }
    }

    private formatearEstado(estado: string): string {
        const estados: Record<string, string> = {
            PENDIENTE: 'Pendiente',
            ACEPTADA: 'Aceptada',
            RECHAZADA: 'Rechazada',
            CANCELADA: 'Cancelada',
            COMPLETADA: 'Completada',
            EN_PROGRESO: 'En progreso'
        };
        return estados[estado] || estado;
    }
}
