import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-racwidget',
    imports: [CommonModule,
        CardModule,
        PanelModule,
        InputTextModule,
        ButtonModule,
        ToastModule,
        FormsModule,
        TextareaModule],
    providers: [MessageService],
    templateUrl: './racwidget.html',

})
export class Racwidget {
    respuestas = {
        compromiso: '',
        humanas: '',
        conocimiento: '',
        aplicacion: '',
        integracion: '',
        aprender: ''
    };
    constructor(private messageService: MessageService) { }

    guardarRespuestas() {
        localStorage.setItem('respuestasRAC', JSON.stringify(this.respuestas));

        this.messageService.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'Las respuestas han sido guardadas correctamente.'
        });
    }

    ngOnInit() {
        const guardadas = localStorage.getItem('respuestasRAC');
        if (guardadas) {
            this.respuestas = JSON.parse(guardadas);
        }
    }

}
