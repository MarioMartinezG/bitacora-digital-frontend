import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';
import { MessageModule } from 'primeng/message';

@Component({
    selector: 'app-justificationwidget',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        CardModule,
        TextareaModule,
        MessageModule
    ],
    templateUrl: './justificationwidget.html'
})
export class Justificationwidget {
    @Input() formGroup!: FormGroup;
    @Input() totalCaracteres: number = 0;
    @Input() errorCaracteres: boolean = false;
}
