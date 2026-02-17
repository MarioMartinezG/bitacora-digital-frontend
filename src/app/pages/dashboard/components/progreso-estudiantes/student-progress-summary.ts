import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TutorReviewService } from '../../../../core/services/tutor-review.service';
import { EstudianteProgresoResumenDTO } from '../../../../core/models/estudiante-progreso.model';
import { getSeverityByEstado, getLabelByEstado } from '../../../../core/models';

@Component({
    selector: 'app-student-progress-summary',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, ProgressBarModule, InputTextModule, IconFieldModule, InputIconModule],
    template: `
        <div class="card">
            <div class="flex items-center justify-between mb-4">
                <div class="font-semibold text-xl">Progreso de Estudiantes</div>
            </div>
            <p-table
                [value]="estudiantes()"
                [paginator]="true"
                [rows]="5"
                [globalFilterFields]="['nombreEstudiante', 'correoEstudiante']"
                [loading]="cargando()"
                #dt>
                <ng-template pTemplate="caption">
                    <div class="flex justify-end">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="dt.filterGlobal($any($event.target).value, 'contains')" placeholder="Buscar..." />
                        </p-iconfield>
                    </div>
                </ng-template>
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nombreEstudiante">Estudiante <p-sortIcon field="nombreEstudiante" /></th>
                        <th pSortableColumn="porcentajeTotal">Progreso <p-sortIcon field="porcentajeTotal" /></th>
                        <th>Estado</th>
                        <th>Acción</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-est>
                    <tr>
                        <td>
                            <div>{{ est.nombreEstudiante }}</div>
                            <div class="text-xs text-surface-400">{{ est.correoEstudiante }}</div>
                        </td>
                        <td>
                            <p-progressbar [value]="est.porcentajeTotal" [showValue]="true" [style]="{height: '1.25rem'}" />
                        </td>
                        <td>
                            <p-tag [severity]="getSeverity(est.estadoGeneral)" [value]="getLabel(est.estadoGeneral)" />
                        </td>
                        <td>
                            <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (onClick)="verEstudiante(est.estudianteId)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="4" class="text-center p-4">No hay estudiantes asignados</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class StudentProgressSummary implements OnInit {
    private tutorReviewService = inject(TutorReviewService);
    private router = inject(Router);

    estudiantes = signal<EstudianteProgresoResumenDTO[]>([]);
    cargando = signal(true);
    getSeverity = getSeverityByEstado;
    getLabel = getLabelByEstado;

    ngOnInit(): void {
        const tutorId = this.tutorReviewService.obtenerTutorId();
        this.tutorReviewService.obtenerProgresoEstudiantes(tutorId).subscribe({
            next: (data) => {
                this.estudiantes.set(data);
                this.cargando.set(false);
            },
            error: () => this.cargando.set(false)
        });
    }

    verEstudiante(estudianteId: number): void {
        this.router.navigate(['/home/tutor/revision', estudianteId]);
    }
}
