import { Component, contentChild } from '@angular/core';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MessageModule } from 'primeng/message';

//Import de Widgets
import { Teachingstaffwidget } from './components/crud-equipo-docente/teachingstaffwidget';
import {Justificationwidget} from './components/justificacion/justificationwidget';
import {Contentwidget} from './components/contenido/contentwidget';

//Componentes
import { LoadingComponent } from '../../../utils/loading/loading';

@Component({
    selector: 'app-caracteriza-component',
    imports: [InputTextModule, FluidModule, ButtonModule, SelectModule, FormsModule, TextareaModule, CardModule, FieldsetModule, AccordionModule, TagModule, Teachingstaffwidget, LoadingComponent, AutoCompleteModule, InputNumber, ToggleButtonModule, MessageModule, Justificationwidget, Contentwidget],
    templateUrl: './caracteriza-component.html',
})
export class CaracterizaComponent {

    autoValue: any[] = [];
    autoFilteredValue: any[] = [];
    selectedAutoValue: any;

    ngOnInit() {
        // Lista de programas de la Universidad (ejemplo)
        this.autoValue = [
            { name: 'Medicina', code: 'MED' },
            { name: 'Odontología', code: 'ODO' },
            { name: 'Psicología', code: 'PSI' },
            { name: 'Enfermería', code: 'ENF' },
            { name: 'Ingeniería de Sistemas', code: 'IS' },
            { name: 'Ingeniería Industrial', code: 'II' },
            { name: 'Diseño Industrial', code: 'DI' },
            { name: 'Administración de Empresas', code: 'ADE' },
            { name: 'Economía', code: 'ECO' },
            { name: 'Arte dramatico', code: 'ART' },
            { name: 'Música', code: 'MUS' }
        ];

        // Lógica para periodos académicos
        const currentYear = new Date().getFullYear(); // Año actual
        const years = 10; // Proyección a 10 años

        for (let y = 0; y < years; y++) {
            const year = currentYear + y;
            this.periodos.push({ name: `${year}-1`, code: `${year}-1` });
            this.periodos.push({ name: `${year}-2`, code: `${year}-2` });
        }
    }

    filterPrograms(event: AutoCompleteCompleteEvent) {
        const query = event.query.toLowerCase();
        this.autoFilteredValue = (this.autoValue as any[]).filter(program =>
            program.name.toLowerCase().includes(query)
        );
    }
    selectedTipoAsignatura: any;

    tiposAsignatura = [
        { name: 'Obligatoria', code: 'OB' },
        { name: 'Electiva', code: 'EL' }
    ];
    semestre: number = 1;
    selectedPeriodo: any;
    periodos: { name: string, code: string }[] = [];

    prerequisitoValue: boolean = false;
    materiaPrerequisito: string = '';    // Texto de la materia

    numeroCreditos: number = 1;
    totalHoras: number = this.numeroCreditos * 48;

    calcularHoras(event: any) {
        this.totalHoras = event.value * 48;
    }

    horasDirecto: number = 0;
    horasIndependiente: number = 0;
    errorHoras: boolean = false;

    validarHoras() {
        const suma = (this.horasDirecto || 0) + (this.horasIndependiente || 0);
        this.errorHoras = suma !== this.totalHoras;
    }

}
