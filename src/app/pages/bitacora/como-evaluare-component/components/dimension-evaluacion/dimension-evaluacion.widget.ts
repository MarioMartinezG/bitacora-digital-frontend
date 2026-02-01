import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { MessageModule } from 'primeng/message';

interface CriterioEvaluacion {
    valor: number;
    etiqueta: string;
    descripcion: string;
}

interface DimensionData {
    medios: any[];
    otroMedio: boolean;
    otroMedioTexto: string;
    tecnicas: any[];
    otraTecnica: boolean;
    otraTecnicaTexto: string;
    instrumentos: any[];
    otroInstrumento: boolean;
    otroInstrumentoTexto: string;
    tipoEvaluacion: any;
    otroTipoEvaluacion: boolean;
    otroTipoEvaluacionTexto: string;
    participantes: any;
    otrosParticipantes: boolean;
    otrosParticipantesTexto: string;
    momento: any;
    criteriosEvaluacion: CriterioEvaluacion[];
}

@Component({
    selector: 'app-dimension-evaluacion-widget',
    standalone: true,
    imports: [
        CommonModule,
        AccordionModule,
        TagModule,
        MultiSelectModule,
        InputTextModule,
        FormsModule,
        ToggleButtonModule,
        SelectModule,
        TableModule,
        MessageModule
    ],
    templateUrl: './dimension-evaluacion.widget.html'
})
export class DimensionEvaluacionWidget implements OnInit {
    @Input() dimensionNombre: string = '';
    @Input() resultadoAprendizaje: string = '';
    @Input() icono: string = 'pi-star';
    @Input() iconoColor: string = 'text-primary';
    @Input() programaSeleccionado: 'pregrado' | 'posgrado' | null = null;

    data: DimensionData = {
        medios: [],
        otroMedio: false,
        otroMedioTexto: '',
        tecnicas: [],
        otraTecnica: false,
        otraTecnicaTexto: '',
        instrumentos: [],
        otroInstrumento: false,
        otroInstrumentoTexto: '',
        tipoEvaluacion: null,
        otroTipoEvaluacion: false,
        otroTipoEvaluacionTexto: '',
        participantes: null,
        otrosParticipantes: false,
        otrosParticipantesTexto: '',
        momento: null,
        criteriosEvaluacion: []
    };

    mediosOpciones = [
        {
            label: 'Escritos',
            value: 'escritos',
            icon: 'pi pi-file text-green-500',
            items: [
                { label: 'Carpeta o dossier / carpeta colaborativa', value: 'carpeta_dossier' },
                { label: 'Control (Examen)', value: 'control_examen' },
                { label: 'Cuaderno / cuaderno de notas / cuaderno de campo', value: 'cuaderno' },
                { label: 'Cuestionario', value: 'cuestionario' },
                { label: 'Diario reflexivo / diario de clase', value: 'diario' },
                { label: 'Estudio de casos', value: 'estudio_casos' },
                { label: 'Ensayo', value: 'ensayo' },
                { label: 'Examen', value: 'examen' },
                { label: 'Foro virtual', value: 'foro_virtual' },
                { label: 'Memoria', value: 'memoria' },
                { label: 'Monografía', value: 'monografia' },
                { label: 'Informe', value: 'informe' },
                { label: 'Portafolio / portafolio electrónico', value: 'portafolio' },
                { label: 'Póster', value: 'poster' },
                { label: 'Proyecto', value: 'proyecto' },
                { label: 'Pruebas objetivas', value: 'pruebas_objetivas' },
                { label: 'Recensión', value: 'recension' },
                { label: 'Test diagnóstico', value: 'test_diagnostico' },
                { label: 'Trabajo escrito', value: 'trabajo_escrito' }
            ]
        },
        {
            label: 'Orales',
            value: 'orales',
            icon: 'pi pi-microphone text-orange-500',
            items: [
                { label: 'Comunicación', value: 'comunicacion_oral' },
                { label: 'Cuestionario oral', value: 'cuestionario_oral' },
                { label: 'Debate / diálogo grupal', value: 'debate' },
                { label: 'Exposición', value: 'exposicion' },
                { label: 'Discusión grupal', value: 'discusion_grupal' },
                { label: 'Mesa redonda', value: 'mesa_redonda' },
                { label: 'Ponencia', value: 'ponencia' },
                { label: 'Pregunta de clase', value: 'pregunta_clase' },
                { label: 'Presentación oral', value: 'presentacion_oral' }
            ]
        },
        {
            label: 'Prácticos',
            value: 'practicos',
            icon: 'pi pi-cog text-purple-500',
            items: [
                { label: 'Práctica supervisada', value: 'practica_supervisada' },
                { label: 'Demostración / actuación / representación', value: 'demostracion' },
                { label: 'Role playing', value: 'role_playing' }
            ]
        }
    ];

    tecnicasOpciones = [
        {
            label: 'El alumno no interviene',
            value: 'no_interviene',
            icon: 'pi pi-eye text-cyan-500',
            items: [
                { label: 'Análisis documental', value: 'analisis_documental' },
                { label: 'Análisis de producciones', value: 'analisis_producciones' },
                { label: 'Observación directa del alumno', value: 'observacion_directa' },
                { label: 'Observación del grupo', value: 'observacion_grupo' },
                { label: 'Observación sistemática', value: 'observacion_sistematica' },
                { label: 'Análisis de grabación de audio o video', value: 'analisis_audio_video' }
            ]
        },
        {
            label: 'El alumno participa',
            value: 'participa',
            icon: 'pi pi-users text-indigo-500',
            items: [
                { label: 'Autoevaluación (autorreflexión y/o análisis documental)', value: 'autoevaluacion' },
                { label: 'Evaluación entre pares (análisis documental y/o observación)', value: 'coevaluacion' },
                { label: 'Evaluación compartida o colaborativa (entrevista individual o grupal)', value: 'evaluacion_colaborativa' }
            ]
        }
    ];

    instrumentosOpciones = [
        { label: 'Diario del profesor', value: 'diario_profesor' },
        { label: 'Escala de comprobación', value: 'escala_comprobacion' },
        { label: 'Escala de diferencial semántico', value: 'escala_diferencial' },
        { label: 'Escala verbal o numérica', value: 'escala_verbal_numerica' },
        { label: 'Escala descriptiva o rúbrica', value: 'escala_rubrica' },
        { label: 'Escala de estimación', value: 'escala_estimacion' },
        { label: 'Ficha de observación', value: 'ficha_observacion' },
        { label: 'Lista de control', value: 'lista_control' },
        { label: 'Matrices de decisión', value: 'matrices_decision' },
        { label: 'Fichas de seguimiento individual o grupal', value: 'fichas_seguimiento' },
        { label: 'Fichas de autoevaluación', value: 'fichas_autoevaluacion' },
        { label: 'Fichas de evaluación entre iguales', value: 'fichas_entre_iguales' },
        { label: 'Informe de expertos', value: 'informe_expertos' },
        { label: 'Informe de autoevaluación', value: 'informe_autoevaluacion' }
    ];

    tipoEvaluacionOpciones = [
        { label: 'Sumativa', value: 'sumativa' },
        { label: 'Formativa', value: 'formativa' },
        { label: 'Mixta', value: 'mixta' }
    ];

    participantesOpciones = [
        { label: 'Heteroevaluación', value: 'hetero' },
        { label: 'Coevaluación', value: 'co' },
        { label: 'Autoevaluación', value: 'auto' }
    ];

    momentosOpciones = [
        { label: 'Inicial', value: 'inicial' },
        { label: 'Media procesual', value: 'media' },
        { label: 'Final', value: 'final' }
    ];

    criteriosPregrado = [
        { valor: 5.0, etiqueta: 'Logro de resultados de aprendizaje excelente' },
        { valor: 4.0, etiqueta: 'Logro de resultados de aprendizaje bueno' },
        { valor: 3.0, etiqueta: 'Logro de resultados de aprendizaje mínimo aceptable' },
        { valor: 2.0, etiqueta: 'Logro de resultados de aprendizaje bajo' },
        { valor: 1.0, etiqueta: 'Logro de resultados de aprendizaje excesivamente bajo' },
        { valor: 0.0, etiqueta: 'Logro de resultados de aprendizaje nulo' }
    ];

    criteriosPosgrado = [
        { valor: 5.0, etiqueta: 'Logro de resultados de aprendizaje excelente' },
        { valor: 4.0, etiqueta: 'Logro de resultados de aprendizaje bueno' },
        { valor: 3.5, etiqueta: 'Logro de resultados de aprendizaje mínimo aceptable' },
        { valor: 3.0, etiqueta: 'Logro de resultados de aprendizaje bajo' },
        { valor: 2.0, etiqueta: 'Logro de resultados de aprendizaje bajo' },
        { valor: 1.0, etiqueta: 'Logro de resultados de aprendizaje excesivamente bajo' },
        { valor: 0.0, etiqueta: 'Logro de resultados de aprendizaje nulo' }
    ];

    ngOnInit() {
        this.cargarCriteriosEvaluacion();
    }

    ngOnChanges() {
        this.cargarCriteriosEvaluacion();
    }

    cargarCriteriosEvaluacion() {
        if (!this.programaSeleccionado) {
            this.data.criteriosEvaluacion = [];
            return;
        }

        const base = this.programaSeleccionado === 'posgrado'
            ? this.criteriosPosgrado
            : this.criteriosPregrado;

        this.data.criteriosEvaluacion = base.map(c => ({
            valor: c.valor,
            etiqueta: c.etiqueta,
            descripcion: ''
        }));
    }
}
