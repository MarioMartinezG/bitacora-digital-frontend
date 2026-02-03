import { Component, inject, signal, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';
import { TutorService } from '../../../core/services/tutor.service';
import { ToastService } from '../../../core/services/toast.service';
import { SolicitudSesionResponse } from '../../../core/models/tutor.model';

@Component({
    standalone: true,
    selector: 'app-solicitud-sesion-dialog',
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DialogModule,
        TextareaModule,
        MessageModule
    ],
    templateUrl: './solicitud-sesion-dialog.html'
})
export class SolicitudSesionDialog {
    private tutorService = inject(TutorService);
    private toastService = inject(ToastService);

    // Two-way binding para visibilidad
    visible = model<boolean>(false);

    // Output cuando se crea una solicitud exitosamente
    solicitudCreada = output<SolicitudSesionResponse>();

    // Estado interno
    solicitudMotivo = '';
    solicitudEnviando = signal(false);
    solicitudExitosa = signal<SolicitudSesionResponse | null>(null);
    solicitudError = signal<string | null>(null);

    onVisibleChange(value: boolean): void {
        if (!value) {
            this.cerrarDialog();
        }
    }

    cerrarDialog(): void {
        this.visible.set(false);
        this.solicitudMotivo = '';
        this.solicitudExitosa.set(null);
        this.solicitudError.set(null);
    }

    limpiarError(): void {
        this.solicitudError.set(null);
    }

    enviarSolicitud(): void {
        if (!this.solicitudMotivo.trim() || this.solicitudEnviando()) {
            return;
        }

        this.solicitudEnviando.set(true);

        this.tutorService.solicitarSesionTutor(this.solicitudMotivo.trim()).subscribe({
            next: (response) => {
                this.solicitudExitosa.set(response);
                this.solicitudEnviando.set(false);
                this.solicitudCreada.emit(response);
                this.toastService.showSuccess(
                    'Solicitud enviada',
                    `Tu tutor ${response.nombreTutor} ha sido notificado`
                );
            },
            error: (error) => {
                this.solicitudEnviando.set(false);
                this.solicitudError.set(error.message || 'No se pudo enviar la solicitud');
            }
        });
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleString('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    get dialogHeader(): string {
        return this.solicitudExitosa() ? 'Solicitud enviada' : 'Nueva solicitud de sesion';
    }
}
