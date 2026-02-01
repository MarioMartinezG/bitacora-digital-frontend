import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';

import { DimensionEvaluacionWidget } from './components/dimension-evaluacion/dimension-evaluacion.widget';

interface DimensionAprendizaje {
    nombre: string;
    resultado: string;
    icono: string;
    iconoColor: string;
}

@Component({
    selector: 'app-como-evaluare-component',
    imports: [CommonModule, FormsModule, ButtonModule, CardModule, DimensionEvaluacionWidget, RadioButtonModule, AccordionModule, TagModule, TableModule],
    templateUrl: './como-evaluare-component.html',
})
export class ComoEvaluareComponent {
    programaSeleccionado: 'pregrado' | 'posgrado' | null = null;

    dimensiones: DimensionAprendizaje[] = [
        {
            nombre: 'Compromiso o valoración',
            resultado: 'Desarrolla la capacidad de reconocer el valor del aprendizaje.',
            icono: 'pi-bolt',
            iconoColor: 'text-primary'
        },
        {
            nombre: 'Dimensiones humanas del aprendizaje',
            resultado: 'Reconoce la importancia del trabajo colaborativo y la empatía.',
            icono: 'pi-users',
            iconoColor: 'text-green-500'
        },
        {
            nombre: 'Conocimiento Fundamental',
            resultado: 'Comprende los fundamentos teóricos del curso.',
            icono: 'pi-book',
            iconoColor: 'text-orange-500'
        },
        {
            nombre: 'Aplicación del aprendizaje',
            resultado: 'Aplica los conocimientos adquiridos a contextos reales.',
            icono: 'pi-cog',
            iconoColor: 'text-cyan-600'
        },
        {
            nombre: 'Integración',
            resultado: 'Integra los saberes del curso con otras áreas del conocimiento.',
            icono: 'pi-link',
            iconoColor: 'text-indigo-500'
        },
        {
            nombre: 'Aprender a aprender',
            resultado: 'Desarrolla autonomía en su proceso de aprendizaje.',
            icono: 'pi-compass',
            iconoColor: 'text-purple-500'
        }
    ];

    seleccionarPrograma(tipo: 'pregrado' | 'posgrado') {
        this.programaSeleccionado = tipo;
    }

    esProgramaSeleccionado(tipo: 'pregrado' | 'posgrado'): boolean {
        return this.programaSeleccionado === tipo;
    }
    criteriosEvaluacionChecklist = [
        {
            titulo: 'Definición de los criterios de evaluación',
            preguntas: [
                { texto: '¿Son observables y medibles?', respuesta: null },
                { texto: '¿Son pertinentes?', respuesta: null },
                { texto: '¿Tengo un plan de socialización con mis estudiantes?', respuesta: null }
            ]
        },
        {
            titulo: 'Selección de los instrumentos de evaluación',
            preguntas: [
                {
                    texto: '¿Están alineados con el resultado y la dimensión del aprendizaje?',
                    respuesta: null
                },
                {
                    texto: '¿Son variados y consideran los estilos de aprendizaje?',
                    respuesta: null
                },
                {
                    texto: '¿Establecen niveles de desempeño claros para los estudiantes?',
                    respuesta: null
                }
            ]
        },
        {
            titulo: 'Participantes',
            preguntas: [
                {
                    texto: '¿Existen actividades de auto, hetero y coevaluación con instrumentos específicos?',
                    respuesta: null
                }
            ]
        },
        {
            titulo: 'Diálogo para la retroalimentación',
            preguntas: [
                {
                    texto: '¿He planeado y socializado los momentos de retroalimentación?',
                    respuesta: null
                },
                {
                    texto: '¿Se combinan la evaluación formativa con la sumativa?',
                    respuesta: null
                }
            ]
        },
        {
            titulo: 'Calificación final (Numérica)',
            preguntas: [
                {
                    texto: '¿Refleja el alcance de los resultados de aprendizaje?',
                    respuesta: null
                },
                {
                    texto: '¿Corresponde a la escala institucional?',
                    respuesta: null
                },
                {
                    texto: '¿Es flexible y contempla diferentes métodos de calificación?',
                    respuesta: null
                }
            ]
        }
    ];

}
