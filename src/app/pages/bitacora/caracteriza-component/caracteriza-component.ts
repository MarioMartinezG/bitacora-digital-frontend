import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// PrimeNG
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MessageModule } from 'primeng/message';

// Widgets (con persistencia propia)
import { Teachingstaffwidget } from './components/crud-equipo-docente/teachingstaffwidget';
import { Contentwidget } from './components/contenido/contentwidget';

// Widgets (integrados al formulario)
import { Justificationwidget } from './components/justificacion/justificationwidget';

// Componentes comunes
import { LoadingComponent } from '../../../utils/loading/loading';
import { SaveStatusIndicatorComponent } from '../../../shared/components/save-status-indicator/save-status-indicator';
import { BitacoraCommentButtonComponent } from '../../../shared/components/bitacora-comment-button/bitacora-comment-button';

// Base
import { BaseBitacoraComponent, SectionConfig } from '../shared/base-bitacora.component';

// Services
import { ContentService } from '../../../core/services/content.service';
import { TeachingStaffService } from '../../../core/services/teachingstaff.service';

// Models
import { EstadoAvance, calcularEstadoAvance } from '../../../core/models';

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
        AccordionModule,
        TagModule,
        AutoCompleteModule,
        InputNumberModule,
        ToggleButtonModule,
        MessageModule,
        Teachingstaffwidget,
        Contentwidget,
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
    private contentService = inject(ContentService);
    private teachingStaffService = inject(TeachingStaffService);
    private contentSubscription: Subscription | null = null;
    private teachingStaffSubscription: Subscription | null = null;

    // Codigo de seccion
    protected seccionCodigo = 'caracteriza';

    // Configuracion de secciones para calculo de progreso
    protected sectionsConfig: SectionConfig[] = [];

    // Conteo de registros de secciones con persistencia propia
    equipoDocenteCount = signal(0);
    contenidosCount = signal(0);

    // Opciones para autocomplete de programas
    programas = [
        { name: 'Medicina', code: 'MED' },
        { name: 'Odontologia', code: 'ODO' },
        { name: 'Psicologia', code: 'PSI' },
        { name: 'Enfermeria', code: 'ENF' },
        { name: 'Ingenieria de Sistemas', code: 'IS' },
        { name: 'Ingenieria Industrial', code: 'II' },
        { name: 'Diseno Industrial', code: 'DI' },
        { name: 'Administracion de Empresas', code: 'ADE' },
        { name: 'Economia', code: 'ECO' },
        { name: 'Arte dramatico', code: 'ART' },
        { name: 'Musica', code: 'MUS' }
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

    // Getter para validar horas
    get errorHoras(): boolean {
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
            // Estado inicial
            prerequisitoControl.value ? materiaControl.enable() : materiaControl.disable();
            // Escuchar cambios
            prerequisitoControl.valueChanges.subscribe(value => {
                value ? materiaControl.enable() : materiaControl.disable();
            });
        }

        // Sincronizar cambios CRUD al form control oculto
        // Esto dispara el auto-save cuando el usuario agrega/edita/elimina registros
        this.teachingStaffSubscription = this.teachingStaffService.dataChanged$.subscribe(() => {
            this.form.get('equipoDocente')?.setValue(this.teachingStaffService.getData());
        });
        this.contentSubscription = this.contentService.dataChanged$.subscribe(() => {
            this.form.get('contenidos')?.setValue(this.contentService.getData());
        });
    }

    override ngOnDestroy(): void {
        this.teachingStaffSubscription?.unsubscribe();
        this.contentSubscription?.unsubscribe();
        super.ngOnDestroy();
    }

    /**
     * Override: al cargar datos del backend, hidratar ContentService
     * con los temas/subtemas guardados en el JSON
     */
    protected override patchFormWithData(data: any): void {
        if (data.equipoDocente) {
            this.teachingStaffService.loadFromData(data.equipoDocente);
        }
        if (data.contenidos) {
            this.contentService.loadFromData(data.contenidos);
        }
        super.patchFormWithData(data);
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
                respuesta1: [''],
                respuesta2: [''],
                respuesta3: ['']
            }),
            equipoDocente: [null],
            contenidos: [null]
        });
    }

    /** Deriva el estado a partir de un conteo de registros (0 = sin_avances, 1+ = completado) */
    getEstadoFromCount(count: number): EstadoAvance {
        return count > 0 ? 'completado' : 'sin_avances';
    }

    /** Callback cuando cambia el conteo de registros en widgets con persistencia propia */
    onRecordCountChange(section: 'equipoDocente' | 'contenidos', count: number): void {
        if (section === 'equipoDocente') {
            this.equipoDocenteCount.set(count);
        } else {
            this.contenidosCount.set(count);
        }
        this.calculateProgress();
    }

    /**
     * Sobrescribimos calculateProgress
     */
    protected override calculateProgress(): void {
        const datosBasicosFields = [
            'programa', 'nombreAsignatura', 'tipoAsignatura', 'semestre',
            'periodoAcademico', 'numeroCreditos', 'horasDirecto', 'horasIndependiente'
        ];
        const justificacionFields = ['respuesta1', 'respuesta2', 'respuesta3'];

        // Calcular progreso de datos basicos
        let datosCompletados = 0;
        const datosGroup = this.form.get('datosBasicos');
        datosBasicosFields.forEach(field => {
            const value = datosGroup?.get(field)?.value;
            if (this.hasValue(value)) datosCompletados++;
        });
        const datosPercentage = Math.round((datosCompletados / datosBasicosFields.length) * 100);

        // Calcular progreso de justificacion
        let justCompletados = 0;
        const justGroup = this.form.get('justificacion');
        justificacionFields.forEach(field => {
            const value = justGroup?.get(field)?.value;
            if (value && value.trim().length > 0) justCompletados++;
        });
        const justPercentage = Math.round((justCompletados / justificacionFields.length) * 100);

        // Progreso de secciones con persistencia propia (binario: 0% o 100%)
        const equipoDocentePercentage = this.equipoDocenteCount() > 0 ? 100 : 0;
        const contenidosPercentage = this.contenidosCount() > 0 ? 100 : 0;

        // Progreso total (promedio de 4 secciones)
        const totalPercentage = Math.round(
            (datosPercentage + justPercentage + equipoDocentePercentage + contenidosPercentage) / 4
        );

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
                    sectionName: 'equipoDocente',
                    completedFields: this.equipoDocenteCount() > 0 ? 1 : 0,
                    totalFields: 1,
                    percentage: equipoDocentePercentage,
                    estado: calcularEstadoAvance(equipoDocentePercentage)
                },
                {
                    sectionName: 'justificacion',
                    completedFields: justCompletados,
                    totalFields: justificacionFields.length,
                    percentage: justPercentage,
                    estado: calcularEstadoAvance(justPercentage)
                },
                {
                    sectionName: 'contenidos',
                    completedFields: this.contenidosCount() > 0 ? 1 : 0,
                    totalFields: 1,
                    percentage: contenidosPercentage,
                    estado: calcularEstadoAvance(contenidosPercentage)
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

    // Getter para total caracteres de justificacion
    get totalCaracteresJustificacion(): number {
        const j = this.form.get('justificacion');
        return (j?.get('respuesta1')?.value?.length || 0) +
               (j?.get('respuesta2')?.value?.length || 0) +
               (j?.get('respuesta3')?.value?.length || 0);
    }

    get errorCaracteresJustificacion(): boolean {
        return this.totalCaracteresJustificacion > 900;
    }
}
