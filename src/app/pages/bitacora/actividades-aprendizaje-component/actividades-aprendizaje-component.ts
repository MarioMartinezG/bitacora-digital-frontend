import { Component, OnInit } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';

import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

import { LearningDimension } from '../../../core/models/learning-dimension.model'

@Component({
    selector: 'app-actividades-aprendizaje-component',
    imports: [AccordionModule, CardModule, TextareaModule, SelectModule, CommonModule, FormsModule, ButtonModule, DrawerModule, TagModule],
    templateUrl: './actividades-aprendizaje-component.html',
})
export class ActividadesAprendizajeComponent implements OnInit {

    learningDimensions: LearningDimension[] = []
    ngOnInit() {
        this.learningDimensions = [
            {
                dimension: 'Compromiso o valoración',
                resultado: 'Desarrolla la capacidad de reconocer el valor del aprendizaje.',
                metodologia: null,
                descripcion: '',
                image: 'https://cdn-icons-png.flaticon.com/512/1077/1077012.png'
            },
            {
                dimension: 'Dimensiones humanas del aprendizaje',
                resultado: 'Reconoce la importancia del trabajo colaborativo y la empatía.',
                metodologia: null,
                descripcion: '',
                image: 'https://cdn-icons-png.flaticon.com/512/4322/4322993.png'
            },
            {
                dimension: 'Conocimiento Fundamental',
                resultado: 'Comprende los fundamentos teóricos del curso.',
                metodologia: null,
                descripcion: '',
                image: 'https://cdn-icons-png.flaticon.com/512/2232/2232688.png'
            },
            {
                dimension: 'Aplicación del aprendizaje',
                resultado: 'Aplica los conocimientos adquiridos a contextos reales.',
                metodologia: null,
                descripcion: '',
                image: 'https://cdn-icons-png.flaticon.com/512/2784/2784459.png'
            },
            {
                dimension: 'Integración',
                resultado: 'Integra los saberes del curso con otras áreas del conocimiento.',
                metodologia: null,
                descripcion: '',
                image: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png'
            },
            {
                dimension: 'Aprender a aprender',
                resultado: 'Desarrolla autonomía en su proceso de aprendizaje.',
                metodologia: null,
                descripcion: '',
                image: 'https://cdn-icons-png.flaticon.com/512/4138/4138124.png'
            }

        ];
    }

    // Metodologías disponibles (lista desplegable)
    metodologias = [
        { label: 'Aprendizaje basado en proyectos', value: 'proyectos' },
        { label: 'Aprendizaje basado en juegos', value: 'juegos' },
        { label: 'Aprendizaje invertido', value: 'invertido' },
        { label: 'Aprendizaje basado en evidencia', value: 'evidencia' },
        { label: 'Diálogo reflexivo', value: 'dialogo' },
        { label: 'Aprendizaje cooperativo', value: 'cooperativo' },
        { label: 'Aprendizaje basado en problemas', value: 'problemas' },
        { label: 'Investigación - Acción', value: 'investigacion' },
        { label: 'Aprendizaje a través del servicio', value: 'servicio' },
        { label: 'Aprendizaje adaptativo', value: 'adaptativo' },
    ]


    guardarDatos() {
        console.log('Datos guardados:', this.learningDimensions);
        // Aquí podrías integrar el servicio HTTP para guardar los datos
    }

}

