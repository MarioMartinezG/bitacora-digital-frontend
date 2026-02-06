import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';

@Component({
    selector: 'app-racwidget',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        CardModule,
        TextareaModule
    ],
    templateUrl: './racwidget.html',
})
export class Racwidget {
    @Input() formGroup!: FormGroup;
}
