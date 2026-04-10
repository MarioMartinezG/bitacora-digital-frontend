import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button';
import { Rapwidget } from './components/rap/rapwidget';
import { Racwidget } from './components/rac/racwidget';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';

// Models
import { calcularEstadoAvance } from '../../../core/models';

@Component({
    selector: 'app-rap-rac-component',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        AccordionModule,
        TagModule,
        ButtonModule,
        LoadingComponent,
        SaveStatusIndicatorComponent,
        BitacoraCommentButtonComponent,
        Rapwidget,
        Racwidget,
        ExportButtonComponent
    ],
    templateUrl: './rap-rac-component.html',
    styleUrl: './rap-rac-component.css'
})
export class RapRacComponent extends BaseBitacoraComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);

    // Codigo de seccion
    protected seccionCodigo = 'rap-rac';

    // Configuracion de secciones para calculo de progreso
    protected sectionsConfig: SectionConfig[] = [
        {
            name: 'rac',
            formGroupName: 'rac',
            fields: ['compromiso', 'humanas', 'conocimiento', 'aplicacion', 'integracion', 'aprender']
        }
    ];

    // Getters para los subformularios
    get rapFormArray(): FormArray {
        return this.form.get('rap.resultados') as FormArray;
    }

    get racFormGroup(): FormGroup {
        return this.form.get('rac') as FormGroup;
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    protected initForm(): void {
        this.form = this.fb.group({
            rap: this.fb.group({
                resultados: this.fb.array([])
            }),
            rac: this.fb.group({
                compromiso: [''],
                humanas: [''],
                conocimiento: [''],
                aplicacion: [''],
                integracion: [''],
                aprender: ['']
            })
        });
    }

    /**
     * Sobrescribimos patchFormWithData para manejar el FormArray de RAP
     */
    protected override patchFormWithData(data: any): void {
        // Cargar RAC (campos simples)
        if (data?.rac) {
            this.form.get('rac')?.patchValue(data.rac, { emitEvent: false });
        }

        // Cargar RAP (FormArray)
        if (data?.rap?.resultados && Array.isArray(data.rap.resultados)) {
            const rapArray = this.form.get('rap.resultados') as FormArray;
            rapArray.clear();
            data.rap.resultados.forEach((resultado: string) => {
                rapArray.push(this.fb.control(resultado));
            });
        }
    }

    /**
     * Sobrescribimos calculateProgress para incluir RAP
     */
    protected override calculateProgress(): void {
        // Calcular progreso de RAC (6 campos)
        const racFields = ['compromiso', 'humanas', 'conocimiento', 'aplicacion', 'integracion', 'aprender'];
        let racCompleted = 0;
        const racGroup = this.form.get('rac');

        racFields.forEach(field => {
            const value = racGroup?.get(field)?.value;
            if (value && value.trim().length > 0) {
                racCompleted++;
            }
        });

        const racPercentage = Math.round((racCompleted / racFields.length) * 100);

        // Calcular progreso de RAP (al menos 1 resultado agregado = 100%)
        const rapArray = this.form.get('rap.resultados') as FormArray;
        const rapHasResults = rapArray.length > 0;
        const rapPercentage = rapHasResults ? 100 : 0;

        // Progreso total (promedio de ambas secciones)
        const totalPercentage = Math.round((racPercentage + rapPercentage) / 2);

        this._progress.set({
            sections: [
                {
                    sectionName: 'rap',
                    completedFields: rapArray.length,
                    totalFields: 1, // Al menos 1 resultado
                    percentage: rapPercentage,
                    estado: calcularEstadoAvance(rapPercentage)
                },
                {
                    sectionName: 'rac',
                    completedFields: racCompleted,
                    totalFields: racFields.length,
                    percentage: racPercentage,
                    estado: calcularEstadoAvance(racPercentage)
                }
            ],
            totalPercentage,
            estado: calcularEstadoAvance(totalPercentage)
        });
    }

    // Metodos para RAP (llamados desde el subcomponente)
    agregarResultadoRap(resultado: string): void {
        if (resultado.trim()) {
            this.rapFormArray.push(this.fb.control(resultado.trim()));
            this.calculateProgress();
        }
    }

    eliminarResultadoRap(index: number): void {
        this.rapFormArray.removeAt(index);
        this.calculateProgress();
    }

    getResultadosRap(): string[] {
        return this.rapFormArray.controls.map(c => c.value);
    }
}
