import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { BaseHttpService } from '../../../core/services/base-http.service';
import { LoginService } from '../../../core/services/login.service';

interface SolicitudSesion {
    id: number;
    estudianteId: number;
    tutorId: number;
    motivo: string;
    estado: string;
    fechaSolicitud: string;
    fechaRespuesta?: string;
    notasTutor?: string;
    nombreEstudiante?: string;
}

@Component({
    selector: 'app-tutor-solicitudes-sesion',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, TagModule, DialogModule, TextareaModule, SelectModule, CardModule],
    template: `
        <p-card>
            <ng-template pTemplate="header">
                <div class="flex items-center justify-between p-4">
                    <h3 class="m-0">Solicitudes de Sesión</h3>
                </div>
            </ng-template>
            <p-table [value]="solicitudes()" [paginator]="true" [rows]="10" [loading]="cargando()">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Estudiante</th>
                        <th>Motivo</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-sol>
                    <tr>
                        <td>{{ sol.nombreEstudiante || 'Estudiante #' + sol.estudianteId }}</td>
                        <td>{{ sol.motivo }}</td>
                        <td>{{ sol.fechaSolicitud | date:'dd/MM/yyyy HH:mm' }}</td>
                        <td>
                            <p-tag [severity]="getEstadoSeverity(sol.estado)" [value]="sol.estado" />
                        </td>
                        <td>
                            @if (sol.estado === 'PENDIENTE') {
                                <div class="flex gap-2">
                                    <p-button icon="pi pi-check" severity="success" [text]="true" (onClick)="responder(sol, 'ACEPTADA')" pTooltip="Aceptar" />
                                    <p-button icon="pi pi-times" severity="danger" [text]="true" (onClick)="abrirDialogRechazo(sol)" pTooltip="Rechazar" />
                                </div>
                            }
                            @if (sol.estado === 'ACEPTADA') {
                                <p-button icon="pi pi-check-circle" label="Completar" severity="success" [text]="true" (onClick)="responder(sol, 'COMPLETADA')" />
                            }
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5" class="text-center p-4">No hay solicitudes</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        <p-dialog header="Rechazar solicitud" [(visible)]="dialogVisible" [style]="{width: '25rem'}">
            <div class="flex flex-col gap-3">
                <label>Notas (opcional):</label>
                <textarea pTextarea [(ngModel)]="notasRechazo" rows="3" class="w-full"></textarea>
            </div>
            <ng-template pTemplate="footer">
                <p-button label="Cancelar" [text]="true" (onClick)="dialogVisible = false" />
                <p-button label="Rechazar" severity="danger" (onClick)="confirmarRechazo()" />
            </ng-template>
        </p-dialog>
    `
})
export class TutorSolicitudesSesion extends BaseHttpService implements OnInit {
    private loginService = inject(LoginService);

    solicitudes = signal<SolicitudSesion[]>([]);
    cargando = signal(true);
    dialogVisible = false;
    solicitudSeleccionada: SolicitudSesion | null = null;
    notasRechazo = '';

    constructor(http: HttpClient) {
        super(http);
    }

    ngOnInit(): void {
        this.cargarSolicitudes();
    }

    cargarSolicitudes(): void {
        const user = JSON.parse(this.loginService.getUser() ?? '{}');
        this.get<SolicitudSesion[]>(`/api/solicitudes-sesion/tutor/${user.id}`).subscribe({
            next: (data) => {
                this.solicitudes.set(data);
                this.cargando.set(false);
            },
            error: () => this.cargando.set(false)
        });
    }

    responder(solicitud: SolicitudSesion, estado: string): void {
        this.put<SolicitudSesion>(`/api/solicitudes-sesion/${solicitud.id}/responder`, { estado, notasTutor: '' }).subscribe({
            next: () => this.cargarSolicitudes()
        });
    }

    abrirDialogRechazo(solicitud: SolicitudSesion): void {
        this.solicitudSeleccionada = solicitud;
        this.notasRechazo = '';
        this.dialogVisible = true;
    }

    confirmarRechazo(): void {
        if (this.solicitudSeleccionada) {
            this.put<SolicitudSesion>(`/api/solicitudes-sesion/${this.solicitudSeleccionada.id}/responder`, {
                estado: 'RECHAZADA',
                notasTutor: this.notasRechazo
            }).subscribe({
                next: () => {
                    this.dialogVisible = false;
                    this.cargarSolicitudes();
                }
            });
        }
    }

    getEstadoSeverity(estado: string): 'success' | 'warn' | 'danger' | 'info' {
        const map: Record<string, any> = {
            'PENDIENTE': 'warn',
            'ACEPTADA': 'info',
            'RECHAZADA': 'danger',
            'COMPLETADA': 'success'
        };
        return map[estado] || 'info';
    }
}
