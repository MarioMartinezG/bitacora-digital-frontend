import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-justificationwidget',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        MessageModule,
        TextareaModule
    ],
    templateUrl: './justificationwidget.html'
})
export class Justificationwidget {
    @Input() formGroup!: FormGroup;
}
