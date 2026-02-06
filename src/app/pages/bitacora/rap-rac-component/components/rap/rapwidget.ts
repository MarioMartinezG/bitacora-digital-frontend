import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-rapwidget',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        InputTextModule,
        ButtonModule,
        MessageModule,
        TooltipModule
    ],
    templateUrl: './rapwidget.html',
})
export class Rapwidget {
    @Input() resultados: string[] = [];
    @Output() onAgregar = new EventEmitter<string>();
    @Output() onEliminar = new EventEmitter<number>();

    nuevoResultado: string = '';

    agregarResultado(): void {
        const texto = this.nuevoResultado.trim();
        if (texto) {
            this.onAgregar.emit(texto);
            this.nuevoResultado = '';
        }
    }

    eliminarResultado(index: number): void {
        this.onEliminar.emit(index);
    }
}
