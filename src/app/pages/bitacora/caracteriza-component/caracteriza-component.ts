import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// PrimeNG
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MessageModule } from 'primeng/message';

// Widgets (integrados al formulario)
import { Justificationwidget } from './components/justificacion/justificationwidget';

// Componentes comunes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';

// Models
import { calcularEstadoAvance } from '../../../core/models';

@Component({
    selector: 'app-caracteriza-component',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        FormsModule,
        InputTextModule,
        FluidModule,
        ButtonModule,
        SelectModule,
        CardModule,
        FieldsetModule,
        TagModule,
        AutoCompleteModule,
        InputNumberModule,
        ToggleButtonModule,
        MessageModule,
        Justificationwidget,
        LoadingComponent,
        SaveStatusIndicatorComponent,
        BitacoraCommentButtonComponent
    ],
    templateUrl: './caracteriza-component.html',
    styleUrl: './caracteriza-component.css'
})
export class CaracterizaComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    private horasSubscriptions: Subscription[] = [];

    // Codigo de seccion
    protected seccionCodigo = 'caracteriza';

    // Configuracion de secciones para calculo de progreso
    protected sectionsConfig: SectionConfig[] = [];

    // Opciones para autocomplete de programas
    programas = [
        { name: 'Medicina', code: 'MED' },
        { name: 'Odontología', code: 'ODO' },
        { name: 'Psicología', code: 'PSI' },
        { name: 'Enfermería', code: 'ENF' },
        { name: 'Ingeniería de Sistemas', code: 'IS' },
        { name: 'Ingeniería Industrial', code: 'II' },
        { name: 'Diseno Industrial', code: 'DI' },
        { name: 'Administración de Empresas', code: 'ADE' },
        { name: 'Economía', code: 'ECO' },
        { name: 'Arte dramático', code: 'ART' },
        { name: 'Música', code: 'MUS' }
    ];
    filteredProgramas: any[] = [];

    tiposAsignatura = [
        { name: 'Obligatoria', code: 'OB' },
        { name: 'Electiva', code: 'EL' }
    ];

    periodos: { name: string, code: string }[] = [];

    // Getter para el FormGroup de justificacion
    get justificacionFormGroup(): FormGroup {
        return this.form.get('justificacion') as FormGroup;
    }

    // Getter para calcular total horas
    get totalHoras(): number {
        const creditos = this.form.get('datosBasicos.numeroCreditos')?.value || 0;
        return creditos * 48;
    }

    // Hay algún campo de horas con valor negativo
    get errorHorasNegativas(): boolean {
        const horasDirecto = this.form.get('datosBasicos.horasDirecto')?.value ?? 0;
        const horasIndependiente = this.form.get('datosBasicos.horasIndependiente')?.value ?? 0;
        return horasDirecto < 0 || horasIndependiente < 0;
    }

    // Algún campo supera el total de horas disponibles
    get errorHorasExcedidas(): boolean {
        if (this.totalHoras <= 0) return false;
        const horasDirecto = this.form.get('datosBasicos.horasDirecto')?.value ?? 0;
        const horasIndependiente = this.form.get('datosBasicos.horasIndependiente')?.value ?? 0;
        return horasDirecto > this.totalHoras || horasIndependiente > this.totalHoras;
    }

    // La suma no coincide con el total (caso: créditos cambiaron después de ingresar horas)
    get errorHoras(): boolean {
        if (this.errorHorasNegativas || this.errorHorasExcedidas) return false;
        const horasDirecto = this.form.get('datosBasicos.horasDirecto')?.value || 0;
        const horasIndependiente = this.form.get('datosBasicos.horasIndependiente')?.value || 0;
        return (horasDirecto + horasIndependiente) !== this.totalHoras && this.totalHoras > 0;
    }

    override ngOnInit(): void {
        this.initPeriodos();
        super.ngOnInit();

        // Habilitar/deshabilitar materiaPrerequisito segun el valor de prerequisito
        const prerequisitoControl = this.form.get('datosBasicos.prerequisito');
        const materiaControl = this.form.get('datosBasicos.materiaPrerequisito');
        if (prerequisitoControl && materiaControl) {
            prerequisitoControl.value ? materiaControl.enable() : materiaControl.disable();
            prerequisitoControl.valueChanges.subscribe(value => {
                value ? materiaControl.enable() : materiaControl.disable();
            });
        }

        // Auto-cálculo de horas complementarias
        const horasDirectoCtrl = this.form.get('datosBasicos.horasDirecto');
        const horasIndependienteCtrl = this.form.get('datosBasicos.horasIndependiente');

        if (horasDirectoCtrl && horasIndependienteCtrl) {
            this.horasSubscriptions.push(
                horasDirectoCtrl.valueChanges.subscribe(value => {
                    if (value === null || value === undefined || value < 0) return;
                    const total = this.totalHoras;
                    if (total <= 0 || value > total) return;
                    horasIndependienteCtrl.setValue(total - value, { emitEvent: false });
                }),
                horasIndependienteCtrl.valueChanges.subscribe(value => {
                    if (value === null || value === undefined || value < 0) return;
                    const total = this.totalHoras;
                    if (total <= 0 || value > total) return;
                    horasDirectoCtrl.setValue(total - value, { emitEvent: false });
                })
            );
        }
    }

    override ngOnDestroy(): void {
        this.horasSubscriptions.forEach(s => s.unsubscribe());
        super.ngOnDestroy();
    }

    private initPeriodos(): void {
        const currentYear = new Date().getFullYear();
        const years = 10;
        for (let y = 0; y < years; y++) {
            const year = currentYear + y;
            this.periodos.push({ name: `${year}-1`, code: `${year}-1` });
            this.periodos.push({ name: `${year}-2`, code: `${year}-2` });
        }
    }

    protected initForm(): void {
        this.form = this.fb.group({
            datosBasicos: this.fb.group({
                programa: [null],
                nombreAsignatura: [''],
                tipoAsignatura: [null],
                semestre: [null],
                periodoAcademico: [null],
                prerequisito: [false],
                materiaPrerequisito: [''],
                numeroCreditos: [null],
                horasDirecto: [0],
                horasIndependiente: [0]
            }),
            justificacion: this.fb.group({
                respuesta: ['']
            })
        });
    }

    protected override calculateProgress(): void {
        const datosBasicosFields = [
            'programa', 'nombreAsignatura', 'tipoAsignatura', 'semestre',
            'periodoAcademico', 'numeroCreditos', 'horasDirecto', 'horasIndependiente'
        ];

        // Calcular progreso de datos basicos
        let datosCompletados = 0;
        const datosGroup = this.form.get('datosBasicos');
        datosBasicosFields.forEach(field => {
            const value = datosGroup?.get(field)?.value;
            if (this.hasValue(value)) datosCompletados++;
        });
        const datosPercentage = Math.round((datosCompletados / datosBasicosFields.length) * 100);

        // Calcular progreso de justificacion (1 campo)
        const respuesta = this.form.get('justificacion.respuesta')?.value;
        const justCompletado = respuesta && respuesta.trim().length > 0 ? 1 : 0;
        const justPercentage = justCompletado * 100;

        // Progreso total (promedio de 2 secciones)
        const totalPercentage = Math.round((datosPercentage + justPercentage) / 2);

        this._progress.set({
            sections: [
                {
                    sectionName: 'datosBasicos',
                    completedFields: datosCompletados,
                    totalFields: datosBasicosFields.length,
                    percentage: datosPercentage,
                    estado: calcularEstadoAvance(datosPercentage)
                },
                {
                    sectionName: 'justificacion',
                    completedFields: justCompletado,
                    totalFields: 1,
                    percentage: justPercentage,
                    estado: calcularEstadoAvance(justPercentage)
                }
            ],
            totalPercentage,
            estado: calcularEstadoAvance(totalPercentage)
        });
    }

    private hasValue(value: any): boolean {
        if (value === null || value === undefined) return false;
        if (typeof value === 'string') return value.trim().length > 0;
        if (typeof value === 'number') return value > 0;
        if (typeof value === 'object') return Object.keys(value).length > 0;
        return true;
    }

    filterProgramas(event: AutoCompleteCompleteEvent): void {
        const query = event.query.toLowerCase();
        this.filteredProgramas = this.programas.filter(p =>
            p.name.toLowerCase().includes(query)
        );
    }
}
