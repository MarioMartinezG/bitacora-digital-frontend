import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoTutorSubseccionService } from '../../../core/services/estado-tutor-subseccion.service';
import { EstadoAvance } from '../../../core/models';

@Component({
    selector: 'app-estado-tutor-selector',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="flex items-center gap-1" [class.opacity-50]="guardando()">
            <button
                type="button"
                class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer"
                [class.bg-red-100]="estadoSeleccionado === 'sin_avances'"
                [class.border-red-400]="estadoSeleccionado === 'sin_avances'"
                [class.text-red-700]="estadoSeleccionado === 'sin_avances'"
                [class.bg-white]="estadoSeleccionado !== 'sin_avances'"
                [class.border-surface-300]="estadoSeleccionado !== 'sin_avances'"
                [class.text-surface-500]="estadoSeleccionado !== 'sin_avances'"
                [disabled]="guardando()"
                (click)="onEstadoChange('sin_avances')">
                <i class="pi pi-times-circle text-xs"></i>
                Sin avances
            </button>
            <button
                type="button"
                class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer"
                [class.bg-orange-100]="estadoSeleccionado === 'en_desarrollo'"
                [class.border-orange-400]="estadoSeleccionado === 'en_desarrollo'"
                [class.text-orange-700]="estadoSeleccionado === 'en_desarrollo'"
                [class.bg-white]="estadoSeleccionado !== 'en_desarrollo'"
                [class.border-surface-300]="estadoSeleccionado !== 'en_desarrollo'"
                [class.text-surface-500]="estadoSeleccionado !== 'en_desarrollo'"
                [disabled]="guardando()"
                (click)="onEstadoChange('en_desarrollo')">
                <i class="pi pi-spinner text-xs"></i>
                En desarrollo
            </button>
            <button
                type="button"
                class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer"
                [class.bg-green-100]="estadoSeleccionado === 'completado'"
                [class.border-green-400]="estadoSeleccionado === 'completado'"
                [class.text-green-700]="estadoSeleccionado === 'completado'"
                [class.bg-white]="estadoSeleccionado !== 'completado'"
                [class.border-surface-300]="estadoSeleccionado !== 'completado'"
                [class.text-surface-500]="estadoSeleccionado !== 'completado'"
                [disabled]="guardando()"
                (click)="onEstadoChange('completado')">
                <i class="pi pi-check-circle text-xs"></i>
                Completado
            </button>
            @if (guardando()) {
                <i class="pi pi-spin pi-spinner text-xs text-surface-400"></i>
            }
        </div>
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

    onEstadoChange(nuevoEstado: EstadoAvance): void {
        if (this.guardando() || nuevoEstado === this.estadoSeleccionado) return;
        this.guardando.set(true);
        this.estadoService.actualizarEstado({
            estudianteId: this.estudianteId,
            seccionCodigo: this.seccionCodigo,
            subseccionCodigo: this.subseccionCodigo,
            estado: nuevoEstado
        }).subscribe({
            next: () => {
                this.estadoSeleccionado = nuevoEstado;
                this.guardando.set(false);
                this.estadoCambiado.emit(nuevoEstado);
            },
            error: () => this.guardando.set(false)
        });
    }
}
