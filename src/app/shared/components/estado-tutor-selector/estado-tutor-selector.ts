import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { EstadoTutorSubseccionService } from '../../../core/services/estado-tutor-subseccion.service';
import { EstadoAvance } from '../../../core/models';

interface EstadoOption {
    label: string;
    value: EstadoAvance;
    icon: string;
    severity: string;
}

@Component({
    selector: 'app-estado-tutor-selector',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule],
    template: `
        <p-select
            [options]="opciones"
            [(ngModel)]="estadoSeleccionado"
            optionLabel="label"
            optionValue="value"
            placeholder="Estado del tutor"
            (onChange)="onEstadoChange($event.value)"
            [loading]="guardando()"
            [style]="{width: '12rem'}" />
    `
})
export class EstadoTutorSelectorComponent {
    private estadoService = inject(EstadoTutorSubseccionService);

    @Input() estudianteId!: number;
    @Input() seccionCodigo!: string;
    @Input() subseccionCodigo!: string;
    @Input() set estadoActual(value: EstadoAvance) {
        this.estadoSeleccionado = value;
    }

    @Output() estadoCambiado = new EventEmitter<EstadoAvance>();

    guardando = signal(false);
    estadoSeleccionado: EstadoAvance = 'sin_avances';

    opciones: EstadoOption[] = [
        { label: 'Sin avances', value: 'sin_avances', icon: 'pi-circle', severity: 'danger' },
        { label: 'En desarrollo', value: 'en_desarrollo', icon: 'pi-spinner', severity: 'warn' },
        { label: 'Completado', value: 'completado', icon: 'pi-check-circle', severity: 'success' }
    ];

    onEstadoChange(nuevoEstado: EstadoAvance): void {
        this.guardando.set(true);
        this.estadoService.actualizarEstado({
            estudianteId: this.estudianteId,
            seccionCodigo: this.seccionCodigo,
            subseccionCodigo: this.subseccionCodigo,
            estado: nuevoEstado
        }).subscribe({
            next: () => {
                this.guardando.set(false);
                this.estadoCambiado.emit(nuevoEstado);
            },
            error: () => this.guardando.set(false)
        });
    }
}
