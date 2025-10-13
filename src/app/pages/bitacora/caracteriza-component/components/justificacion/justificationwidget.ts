import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';





@Component({
    selector: 'app-justificationwidget',
    imports: [CardModule, TextareaModule, FormsModule, MessageModule],
    templateUrl: './justificationwidget.html'
})
export class Justificationwidget {
    // Respuestas de los campos
    respuesta1: string = '';
    respuesta2: string = '';
    respuesta3: string = '';

    // Contador y error
    totalCaracteres: number = 0;
    errorCaracteres: boolean = false;

    validarTotalCaracteres(): void {
        this.totalCaracteres =
            (this.respuesta1?.length || 0) +
            (this.respuesta2?.length || 0) +
            (this.respuesta3?.length || 0);

        this.errorCaracteres = this.totalCaracteres > 900;
    }
}
