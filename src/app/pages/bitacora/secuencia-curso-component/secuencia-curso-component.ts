import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { KnobModule } from 'primeng/knob';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ChartModule } from 'primeng/chart';

@Component({
    selector: 'app-secuencia-curso-component',
    imports: [
        CommonModule,
        FormsModule,
        CardModule,
        TableModule,
        MultiSelectModule,
        InputNumberModule,
        TextareaModule,
        KnobModule,
        ButtonModule,
        ProgressBarModule,
        MessageModule,
        TagModule,
        SelectModule,
        ChartModule
    ],
    templateUrl: './secuencia-curso-component.html',
})
export class SecuenciaCursoComponent implements OnInit {
    // Datos base
    creditosAsignatura = 3;
    horasTotales = this.creditosAsignatura * 48;

    ngOnInit(): void {
        this.calcularHorasTotales();
        this.inicializarChart();
        this.recalcularHoras();
    }

    // Tabla
    secuenciaCurso: any[] = [];

    // Horas
    horasUsadas = 0;
    horasDisponibles = this.horasTotales;
    horasAsignadas = 0;
    porcentajeHorasAsignadas = 0;

    // Horas por tipo
    horasAsync = 0;
    horasSync = 0;
    porcentajeAsync = 0;
    porcentajeSync = 0;

    // Datos para el gráfico Doughnut
    chartData: any;
    chartOptions: any;

    inicializarChart(): void {
        this.chartData = {
            labels: ['Independiente', 'Directo'],
            datasets: [
                {
                    data: [this.horasAsync, this.horasSync],
                    backgroundColor: ['#22c55e', '#f97316'],
                    hoverBackgroundColor: ['#16a34a', '#ea580c']
                }
            ]
        };

        this.chartOptions = {
            cutout: '60%',
            plugins: {
                legend: {
                    display: false
                }
            }
        };
    }

    // Opciones para el tipo de actividad
    tiposActividad = [
        { label: 'Asíncrona', value: 'async' },
        { label: 'Síncrona', value: 'sync' }
    ];

    // Opciones de actividades
    actividadesOpciones = [
        { label: 'Lectura de material', value: 'lectura' },
        { label: 'Video educativo', value: 'video' },
        { label: 'Taller práctico', value: 'taller' },
        { label: 'Debate grupal', value: 'debate' },
        { label: 'Exposición', value: 'exposicion' },
        { label: 'Trabajo colaborativo', value: 'colaborativo' },
        { label: 'Evaluación', value: 'evaluacion' },
        { label: 'Foro de discusión', value: 'foro' },
        { label: 'Estudio de caso', value: 'caso' },
        { label: 'Proyecto', value: 'proyecto' }
    ];

    // Agregar fila
    agregarFila(): void {
        this.secuenciaCurso.push({
            modulo: '',
            actividades: [],
            descripcion: '',
            tipo: null,
            horas: 0
        });
    }

  // ❌ Eliminar fila
  eliminarFila(index: number): void {
    this.secuenciaCurso.splice(index, 1);
    this.recalcularHoras();
  }

calcularHorasTotales(): void {
    this.horasTotales = this.creditosAsignatura * 48;
    this.horasDisponibles = this.horasTotales;
  }

    recalcularHoras(): void {
        // Calcular horas por tipo según el campo 'tipo' de cada fila
        this.horasAsync = this.secuenciaCurso
            .filter(fila => fila.tipo === 'async')
            .reduce((total, fila) => total + (fila.horas || 0), 0);

        this.horasSync = this.secuenciaCurso
            .filter(fila => fila.tipo === 'sync')
            .reduce((total, fila) => total + (fila.horas || 0), 0);

        // Total asignado
        this.horasAsignadas = this.horasAsync + this.horasSync;

        // Disponibles
        this.horasDisponibles = Math.max(this.horasTotales - this.horasAsignadas, 0);

        // Porcentaje de progreso general
        this.porcentajeHorasAsignadas = this.horasTotales > 0
            ? Math.round((this.horasAsignadas / this.horasTotales) * 100)
            : 0;

        // Porcentajes sobre el total asignado (distribución)
        this.porcentajeAsync = this.horasAsignadas > 0
            ? Math.round((this.horasAsync / this.horasAsignadas) * 100)
            : 0;

        this.porcentajeSync = this.horasAsignadas > 0
            ? Math.round((this.horasSync / this.horasAsignadas) * 100)
            : 0;

        // Actualizar datos del gráfico
        this.actualizarChart();
    }

    actualizarChart(): void {
        this.chartData = {
            labels: ['Independiente', 'Directo'],
            datasets: [
                {
                    data: [this.horasAsync, this.horasSync],
                    backgroundColor: ['#22c55e', '#f97316'],
                    hoverBackgroundColor: ['#16a34a', '#ea580c']
                }
            ]
        };
    }

}
