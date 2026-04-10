import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TutorReviewService } from '../../../core/services/tutor-review.service';
import { EstudianteProgresoResumenDTO } from '../../../core/models/estudiante-progreso.model';
import { getSeverityByEstado, getLabelByEstado } from '../../../core/models';

@Component({
    selector: 'app-tutor-revision',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, TagModule, InputTextModule, ProgressBarModule, IconFieldModule, InputIconModule],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Revisión de Respuestas</div>
            <p-table
                [value]="estudiantes()"
                [paginator]="true"
                [rows]="10"
                [globalFilterFields]="['nombreEstudiante', 'correoEstudiante']"
                [loading]="cargando()"
                #dt>
                <ng-template pTemplate="caption">
                    <div class="flex justify-end">
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input pInputText type="text" (input)="dt.filterGlobal($any($event.target).value, 'contains')" placeholder="Buscar estudiante..." />
                        </p-iconfield>
                    </div>
                </ng-template>
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="nombreEstudiante">Nombre <p-sortIcon field="nombreEstudiante" /></th>
                        <th>Correo</th>
                        <th pSortableColumn="porcentajeTotal">Progreso <p-sortIcon field="porcentajeTotal" /></th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-estudiante>
                    <tr>
                        <td>{{ estudiante.nombreEstudiante }}</td>
                        <td>{{ estudiante.correoEstudiante }}</td>
                        <td>
                            <p-progressbar [value]="estudiante.porcentajeTotal" [showValue]="true" [style]="{height: '1.5rem'}" />
                        </td>
                        <td>
                            <p-tag [severity]="getSeverity(estudiante.estadoGeneral)" [value]="getLabel(estudiante.estadoGeneral)" />
                        </td>
                        <td>
                            <p-button icon="pi pi-eye" label="Revisar" [text]="true" (onClick)="verEstudiante(estudiante.estudianteId)" />
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5" class="text-center p-4">No hay estudiantes asignados</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class TutorRevision implements OnInit {
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
