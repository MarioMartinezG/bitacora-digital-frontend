import { Component, inject, OnInit, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { PopoverModule } from 'primeng/popover';
import { ProgressBarModule } from 'primeng/progressbar';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TutorService } from '../../../core/services/tutor.service';
import { ToastService } from '../../../core/services/toast.service';
import { TutorMessage, SolicitudSesionResponse } from '../../../core/models/tutor.model';

@Component({
    selector: 'app-tutor-widget',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        DrawerModule,
        InputTextModule,
        TextareaModule,
        TooltipModule,
        DividerModule,
        PopoverModule,
        ProgressBarModule,
        DialogModule,
        MessageModule
    ],
    templateUrl: './tutor-widget.html',
    styleUrl: './tutor-widget.scss'
})
export class TutorWidget implements OnInit, AfterViewChecked {
    private tutorService = inject(TutorService);
    private toastService = inject(ToastService);

    @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;
    @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;

    // Estado local del widget
    isOpen = signal(false);
    inputMessage = '';
    private shouldScrollToBottom = false;

    // Estado del diálogo de solicitud de sesión
    showSolicitudDialog = signal(false);
    solicitudMotivo = '';
    solicitudEnviando = signal(false);
    solicitudExitosa = signal<SolicitudSesionResponse | null>(null);
    solicitudError = signal<string | null>(null);

    // Signals del servicio
    messages = this.tutorService.messages;
    isLoading = this.tutorService.isLoading;
    hasError = this.tutorService.hasError;
    hasMessages = this.tutorService.hasMessages;
    isOnline = this.tutorService.isOnline;

    ngOnInit(): void {
        // Verificar estado del tutor al iniciar
        this.tutorService.checkStatus().subscribe();
    }

    ngAfterViewChecked(): void {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    toggleWidget(): void {
        this.isOpen.update(value => !value);
        if (this.isOpen()) {
            setTimeout(() => this.focusInput(), 100);
        }
    }

    openWidget(): void {
        this.isOpen.set(true);
        setTimeout(() => this.focusInput(), 100);
    }

    closeWidget(): void {
        this.isOpen.set(false);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    sendMessage(): void {
        const question = this.inputMessage.trim();
        if (!question || this.isLoading()) {
            return;
        }

        this.inputMessage = '';
        this.shouldScrollToBottom = true;

        this.tutorService.ask(question).subscribe({
            next: () => {
                this.shouldScrollToBottom = true;
            },
            error: (error) => {
                this.toastService.showError(
                    'Error de TEIA',
                    error.message || 'No se pudo obtener respuesta en este momento'
                );
            }
        });
    }

    startNewSession(): void {
        this.tutorService.startNewSession();
        this.toastService.showInfo('Nueva conversación', 'TEIA está lista para ayudarte');
    }

    getConfidencePercent(confidence: number): number {
        return Math.round(confidence * 100);
    }

    getConfidenceColor(confidence: number): string {
        if (confidence >= 0.7) return 'bg-green-500';
        if (confidence >= 0.4) return 'bg-yellow-500';
        return 'bg-red-500';
    }

    trackByMessageId(index: number, message: TutorMessage): string {
        return message.id;
    }

    // Métodos para solicitud de sesión con tutor humano
    abrirSolicitudDialog(): void {
        this.solicitudMotivo = '';
        this.solicitudExitosa.set(null);
        this.solicitudError.set(null);
        this.showSolicitudDialog.set(true);
    }

    cerrarSolicitudDialog(): void {
        this.showSolicitudDialog.set(false);
        this.solicitudMotivo = '';
        this.solicitudExitosa.set(null);
        this.solicitudError.set(null);
    }

    limpiarErrorSolicitud(): void {
        this.solicitudError.set(null);
    }

    enviarSolicitudSesion(): void {
        if (!this.solicitudMotivo.trim() || this.solicitudEnviando()) {
            return;
        }

        this.solicitudEnviando.set(true);

        this.tutorService.solicitarSesionTutor(this.solicitudMotivo.trim()).subscribe({
            next: (response) => {
                this.solicitudExitosa.set(response);
                this.solicitudEnviando.set(false);
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

    private scrollToBottom(): void {
        if (this.messagesContainer?.nativeElement) {
            const container = this.messagesContainer.nativeElement;
            container.scrollTop = container.scrollHeight;
        }
    }

    private focusInput(): void {
        if (this.messageInput?.nativeElement) {
            this.messageInput.nativeElement.focus();
        }
    }
}
