import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-rapwidget',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        InputTextModule,
        ButtonModule,
        ListboxModule,
        MessageModule,
        TooltipModule
    ],
    templateUrl: './rapwidget.html',

})
export class Rapwidget {
    nuevoResultado: string = '';
    resultados: string[] = [];

    agregarResultado() {
        const texto = this.nuevoResultado.trim();
        if (texto) {
            this.resultados.push(texto);
            this.nuevoResultado = '';
        }
    }

    eliminarResultado(resultado: string) {
        this.resultados = this.resultados.filter(r => r !== resultado);
    }
}
