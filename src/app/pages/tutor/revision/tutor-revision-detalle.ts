import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TutorReviewService } from '../../../core/services/tutor-review.service';
import { EstudianteProgresoResumenDTO } from '../../../core/models/estudiante-progreso.model';
import { EstadoAvance } from '../../../core/models';

interface SeccionInfo {
    codigo: string;
    nombre: string;
    porcentaje: number;
    estado: EstadoAvance;
    estadoProfesor?: EstadoAvance;
    revisado: boolean;
}

const SECCIONES_NOMBRES: Record<string, string> = {
    'observar': 'Observar, registrar y actuar de manera oportuna',
    'caracteriza': 'Identificación de tu curso',
    'factores': 'Factores Situacionales',
    'actividades': 'Actividades de Aprendizaje',
    'evaluacion': 'Diseño de la evaluación',
    'secuencia': 'Secuencia y cronograma',
    'calificacion': 'Calificación',
    'bibliografia': 'Medios educativos'
};

@Component({
    selector: 'app-tutor-revision-detalle',
    standalone: true,
    imports: [CommonModule, ButtonModule, TagModule, ProgressBarModule, ConfirmDialogModule, ToastModule, TooltipModule],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-toast />
        <p-confirmDialog />
        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
                <p-button icon="pi pi-arrow-left" [text]="true" [rounded]="true" (onClick)="volver()" />
                <h3 class="m-0">Revisión de bitácora</h3>
            </div>

            <!-- Card: info del estudiante + progreso de revisión -->
            <div class="card">
                <div class="flex flex-col lg:flex-row gap-6">

                    <!-- Columna izquierda: avatar + nombre + descripción -->
                    <div class="flex flex-col gap-4 flex-1">

                        <!-- Encabezado del estudiante -->
                        <div class="flex items-center gap-4">
                            <div class="flex items-center justify-center rounded-full text-white font-bold text-xl flex-shrink-0 bg-primary"
                                style="width: 3.5rem; height: 3.5rem;">
                                {{ getIniciales(estudiante()?.nombreEstudiante || 'E') }}
                            </div>
                            <div class="flex flex-col gap-0.5">
                                <div class="font-bold text-xl leading-tight">{{ estudiante()?.nombreEstudiante }}</div>
                                <div class="flex items-center gap-1.5 text-color-secondary text-sm">
                                    <i class="pi pi-envelope text-xs"></i>
                                    <span>{{ estudiante()?.correoEstudiante }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Descripción de la tarea -->
                        <div class="flex gap-3 p-3 rounded-lg bg-surface-50 border border-surface-200">
                            <i class="pi pi-info-circle text-primary mt-0.5 flex-shrink-0"></i>
                            <p class="m-0 text-sm text-color-secondary leading-relaxed">
                                Revisa cada módulo de la bitácora del docente. Puedes evaluar subsecciones, dejar comentarios y asignar un estado:
                                <strong>Pendiente</strong>, <strong>Solicitud de correcciones</strong> o <strong>Completado</strong>.
                                El estudiante verá el estado de cada módulo en su dashboard.
                            </p>
                        </div>
                    </div>

                    <!-- Divisor vertical (solo desktop) -->
                    <div class="hidden lg:block w-px bg-surface-200 self-stretch"></div>

                    <!-- Columna derecha: progreso + acción -->
                    <div class="flex flex-col gap-4 lg:w-64">

                        <!-- Contador de módulos revisados -->
                        <div class="flex items-center gap-3">
                            <div class="flex items-center justify-center rounded-full flex-shrink-0"
                                [class.bg-green-100]="modulosRevisados() === totalModulos"
                                [class.bg-primary-100]="modulosRevisados() < totalModulos"
                                style="width: 2.75rem; height: 2.75rem;">
                                <i class="text-lg"
                                    [class.pi-check-circle]="modulosRevisados() === totalModulos"
                                    [class.text-green-600]="modulosRevisados() === totalModulos"
                                    [class.pi-list-check]="modulosRevisados() < totalModulos"
                                    [class.text-primary]="modulosRevisados() < totalModulos"
                                    [class.pi]="true"></i>
                            </div>
                            <div>
                                <div class="font-bold text-2xl leading-none">
                                    {{ modulosRevisados() }}<span class="text-color-secondary font-normal text-base">/{{ totalModulos }}</span>
                                </div>
                                <div class="text-color-secondary text-xs mt-0.5">módulos revisados</div>
                            </div>
                        </div>

                        <!-- Barra de progreso -->
                        <div class="flex flex-col gap-1.5">
                            <div class="flex justify-between text-xs">
                                <span class="text-color-secondary">Progreso de revisión</span>
                                <span class="font-bold text-primary">{{ porcentajeRevisado() }}%</span>
                            </div>
                            <p-progressbar [value]="porcentajeRevisado()" [showValue]="false" [style]="{height: '0.625rem'}" />
                            <span class="text-xs"
                                [class.text-green-600]="modulosRevisados() === totalModulos"
                                [class.text-color-secondary]="modulosRevisados() < totalModulos">
                                @if (modulosRevisados() === totalModulos) {
                                    <i class="pi pi-check-circle mr-1"></i>Revisión completa
                                } @else {
                                    {{ totalModulos - modulosRevisados() }} módulo(s) pendiente(s)
                                }
                            </span>
                        </div>

                        <!-- Botón / estado de aprobación -->
                        @if (aprobada()) {
                            <div class="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                                <i class="pi pi-check-circle text-green-600 text-xl flex-shrink-0"></i>
                                <div>
                                    <div class="font-semibold text-green-700 text-sm">Bitácora aprobada</div>
                                    <div class="text-xs text-green-600">Coordinador notificado</div>
                                </div>
                            </div>
                        } @else {
                            <p-button
                                label="Aprobar bitácora"
                                icon="pi pi-check-circle"
                                severity="success"
                                styleClass="w-full"
                                [disabled]="modulosRevisados() < totalModulos || aprobando()"
                                [loading]="aprobando()"
                                (onClick)="confirmarAprobacion()"
                                [pTooltip]="modulosRevisados() < totalModulos ? 'Completa todos los módulos antes de aprobar' : ''"
                                tooltipPosition="top"
                            />
                        }
                    </div>

                </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
                @for (seccion of secciones(); track seccion.codigo) {
                    <div class="col-span-12 md:col-span-6 xl:col-span-3">
                        <div class="card cursor-pointer hover:shadow-md transition-shadow duration-200 h-full"
                             (click)="verSeccion(seccion.codigo)"
                             [class.border-green-300]="getEstadoRevision(seccion) === 'completado'"
                             [class.border-orange-300]="getEstadoRevision(seccion) === 'correcciones'"
                             style="border-width: 1px; border-style: solid;">
                            <div class="flex flex-col gap-3 h-full">

                                <!-- Indicador de estado (franja superior) -->
                                @switch (getEstadoRevision(seccion)) {
                                    @case ('completado') {
                                        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 -mx-1">
                                            <i class="pi pi-check-circle text-green-600 text-sm"></i>
                                            <span class="text-xs font-semibold text-green-700">Completado</span>
                                        </div>
                                    }
                                    @case ('correcciones') {
                                        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 -mx-1">
                                            <i class="pi pi-exclamation-circle text-orange-500 text-sm"></i>
                                            <span class="text-xs font-semibold text-orange-600">Solicitud de correcciones</span>
                                        </div>
                                    }
                                    @default {
                                        <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-100 border border-surface-200 -mx-1">
                                            <i class="pi pi-clock text-surface-400 text-sm"></i>
                                            <span class="text-xs font-semibold text-surface-500">Pendiente</span>
                                        </div>
                                    }
                                }

                                <!-- Nombre del módulo -->
                                <span class="font-bold text-sm leading-snug flex-1">{{ seccion.nombre }}</span>

                                <!-- Barra de progreso -->
                                <div class="flex flex-col gap-1">
                                    <div class="flex justify-between text-xs text-surface-400">
                                        <span>Completitud</span>
                                        <span class="font-semibold">{{ getPorcentajeEfectivo(seccion) }}%</span>
                                    </div>
                                    <p-progressbar [value]="getPorcentajeEfectivo(seccion)" [showValue]="false" [style]="{height: '0.5rem'}" />
                                </div>

                                <!-- Botón revisar -->
                                <p-button
                                    icon="pi pi-eye"
                                    label="Revisar módulo"
                                    size="small"
                                    [outlined]="true"
                                    styleClass="w-full"
                                    (click)="$event.stopPropagation(); verSeccion(seccion.codigo)" />
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    `
})
export class TutorRevisionDetalle implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private tutorReviewService = inject(TutorReviewService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    readonly totalModulos = 8;
    estudiante = signal<EstudianteProgresoResumenDTO | null>(null);
    secciones = signal<SeccionInfo[]>([]);
    aprobada = signal(false);
    aprobando = signal(false);

    modulosRevisados = computed(() =>
        this.secciones().filter(s => s.revisado).length
    );
    porcentajeRevisado = computed(() =>
        Math.round((this.modulosRevisados() / this.totalModulos) * 100)
    );

    ngOnInit(): void {
        const estudianteId = Number(this.route.snapshot.paramMap.get('estudianteId'));
        const tutorId = this.tutorReviewService.obtenerTutorId();

        this.tutorReviewService.obtenerProgresoEstudiantes(tutorId).subscribe({
            next: (data) => {
                const est = data.find(e => e.estudianteId === estudianteId);
                if (est) {
                    this.estudiante.set(est);
                    const seccionesList: SeccionInfo[] = Object.keys(SECCIONES_NOMBRES).map(codigo => {
                        const secData = est.secciones?.[codigo];
                        return {
                            codigo,
                            nombre: SECCIONES_NOMBRES[codigo],
                            porcentaje: secData?.porcentaje ?? 0,
                            estado: (secData?.estado ?? 'sin_avances') as EstadoAvance,
                            estadoProfesor: secData?.estadoProfesor as EstadoAvance | undefined,
                            revisado: secData?.revisado ?? false
                        };
                    });
                    this.secciones.set(seccionesList);
                }
            }
        });
    }

    verSeccion(seccionCodigo: string): void {
        const estudianteId = this.route.snapshot.paramMap.get('estudianteId');
        this.router.navigate(['/home/tutor/revision', estudianteId, 'seccion', seccionCodigo]);
    }

    volver(): void {
        this.router.navigate(['/home/tutor/revision']);
    }

    getIniciales(nombre: string): string {
        const partes = nombre.trim().split(' ');
        return partes.length >= 2
            ? (partes[0][0] + partes[1][0]).toUpperCase()
            : nombre.substring(0, 2).toUpperCase();
    }

    getEstadoRevision(seccion: SeccionInfo): 'completado' | 'correcciones' | 'pendiente' {
        if (seccion.revisado) return 'completado';
        if (seccion.estadoProfesor === 'en_desarrollo' || seccion.estadoProfesor === 'sin_avances') return 'correcciones';
        return 'pendiente';
    }

    confirmarAprobacion(): void {
        const nombre = this.estudiante()?.nombreEstudiante ?? 'el estudiante';
        this.confirmationService.confirm({
            message: `¿Confirmas que la bitácora de ${nombre} cumple con todos los requisitos? Esta acción notificará al coordinador.`,
            header: 'Aprobar bitácora',
            icon: 'pi pi-check-circle',
            acceptLabel: 'Sí, aprobar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-success',
            accept: () => {
                const estudianteId = this.estudiante()?.estudianteId;
                if (!estudianteId) return;
                this.aprobando.set(true);
                this.tutorReviewService.aprobarBitacora(estudianteId).subscribe({
                    next: () => {
                        this.aprobada.set(true);
                        this.aprobando.set(false);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Bitácora aprobada',
                            detail: 'El coordinador ha sido notificado correctamente.',
                            life: 5000
                        });
                    },
                    error: () => {
                        this.aprobando.set(false);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'No se pudo aprobar la bitácora. Inténtalo de nuevo.',
                            life: 4000
                        });
                    }
                });
            }
        });
    }

    /**
     * Cuando el tutor asignó un estado, la barra refleja ese criterio y no
     * el porcentaje calculado del estudiante. Así tag y barra son consistentes.
     *   sin_avances  → 0
     *   en_desarrollo → min(porcentaje, 50)  nunca llega a verse "llena"
     *   completado   → 100
     */
    getPorcentajeEfectivo(seccion: SeccionInfo): number {
        if (!seccion.estadoProfesor) return seccion.porcentaje;
        switch (seccion.estadoProfesor) {
            case 'completado':    return 100;
            case 'en_desarrollo': return Math.min(seccion.porcentaje, 90);
            case 'sin_avances':   return Math.min(seccion.porcentaje, 90);
            default:              return seccion.porcentaje;
        }
    }
}
