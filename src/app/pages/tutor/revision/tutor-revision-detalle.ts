import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TutorReviewService } from '../../../core/services/tutor-review.service';
import { EstudianteProgresoResumenDTO } from '../../../core/models/estudiante-progreso.model';
import { EstadoAvance, getSeverityByEstado, getLabelByEstado } from '../../../core/models';

interface SeccionInfo {
    codigo: string;
    nombre: string;
    porcentaje: number;
    estado: EstadoAvance;
    estadoProfesor?: EstadoAvance;
}

const SECCIONES_NOMBRES: Record<string, string> = {
    'observar': 'Observar, registrar y actuar de manera oportuna',
    'caracteriza': 'Identificación de tu curso',
    'factores': 'Factores Situacionales',
    'ajustes': 'Ambientes Sanos y seguros',
    'rap-rac': 'RAP y RAC',
    'actividades': 'Actividades de Aprendizaje',
    'evaluacion': 'Diseño de la evaluación',
    'secuencia': 'Secuencia y cronograma',
    'calificacion': 'Calificación',
    'bibliografia': 'Medios educativos'
};

@Component({
    selector: 'app-tutor-revision-detalle',
    standalone: true,
    imports: [CommonModule, ButtonModule, TagModule, ProgressBarModule],
    template: `
        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
                <p-button icon="pi pi-arrow-left" [text]="true" [rounded]="true" (onClick)="volver()" />
                <h3 class="m-0">{{ estudiante()?.nombreEstudiante || 'Estudiante' }}</h3>
                <span class="text-surface-400">{{ estudiante()?.correoEstudiante }}</span>
            </div>

            <div class="grid grid-cols-12 gap-4">
                @for (seccion of secciones(); track seccion.codigo) {
                    <div class="col-span-12 md:col-span-6 xl:col-span-3">
                        <div class="card cursor-pointer" (click)="verSeccion(seccion.codigo)">
                            <div class="flex flex-col gap-3">
                                <div class="flex items-center justify-between">
                                    <span class="font-semibold text-sm">{{ seccion.nombre }}</span>
                                    <p-tag [severity]="getSeverity(seccion.estadoProfesor || seccion.estado)" [value]="getLabel(seccion.estadoProfesor || seccion.estado)" />
                                </div>
                                <p-progressbar [value]="seccion.porcentaje" [showValue]="true" [style]="{height: '1.25rem'}" />
                                <div class="flex justify-end">
                                    <p-button icon="pi pi-eye" label="Revisar" size="small" [text]="true" />
                                </div>
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

    estudiante = signal<EstudianteProgresoResumenDTO | null>(null);
    secciones = signal<SeccionInfo[]>([]);
    getSeverity = getSeverityByEstado;
    getLabel = getLabelByEstado;

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
                            estadoProfesor: secData?.estadoProfesor as EstadoAvance | undefined
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
}
