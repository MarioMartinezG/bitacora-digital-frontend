import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { CommentThreadComponent } from '../../../shared/components/comment-thread/comment-thread';
import { EstadoTutorSelectorComponent } from '../../../shared/components/estado-tutor-selector/estado-tutor-selector';
import { TutorReviewService } from '../../../core/services/tutor-review.service';
import { EstadoTutorSubseccionService } from '../../../core/services/estado-tutor-subseccion.service';
import { ComentarioSubseccionService } from '../../../core/services/comentario-subseccion.service';
import { EstadoTutorSubseccionDTO } from '../../../core/models/estado-tutor-subseccion.model';
import { getSeverityByEstado, getLabelByEstado, EstadoAvance } from '../../../core/models';
import { BITACORA_LABELS, SELECT_VALUE_LABELS, PanelMeta } from './bitacora-labels';

/** Vista de un panel para renderizar */
interface PanelView {
    key: string;
    label: string;
    displayType: 'fields' | 'table' | 'list' | 'info';
    fields?: { key: string; label: string; value: string }[];
    rows?: any[];
    columns?: { key: string; label: string }[];
    listItems?: string[];
    infoText?: string;
}

@Component({
    selector: 'app-tutor-revision-seccion',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TagModule, AccordionModule, CommentThreadComponent, EstadoTutorSelectorComponent],
    template: `
        <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
                <p-button icon="pi pi-arrow-left" [text]="true" [rounded]="true" (onClick)="volver()" />
                <h3 class="m-0">{{ seccionNombre }}</h3>
                <span class="text-surface-400">(Solo lectura)</span>
            </div>

            @if (cargando()) {
                <div class="flex justify-center p-8">
                    <i class="pi pi-spin pi-spinner text-4xl"></i>
                </div>
            } @else {
                <p-card>
                    <p-accordion [value]="panelValues" [multiple]="true">
                        @for (panel of paneles(); track panel.key) {
                            <p-accordion-panel [value]="panel.key">
                                <p-accordion-header>
                                    <div class="flex items-center justify-between w-full gap-2">
                                        <span>{{ panel.label }}</span>
                                        <div class="flex items-center gap-2">
                                            <app-estado-tutor-selector
                                                [estudianteId]="estudianteId"
                                                [seccionCodigo]="seccionCodigo"
                                                [subseccionCodigo]="panel.key"
                                                [estadoActual]="getEstadoTutor(panel.key)" />
                                            <p-button icon="pi pi-comments" [rounded]="true" [text]="true" severity="secondary" [badge]="getComentarioCount(panel.key)" badgeSeverity="info" (onClick)="abrirComentarios(panel.key); $event.stopPropagation()" />
                                        </div>
                                    </div>
                                </p-accordion-header>
                                <p-accordion-content>
                                    <div class="pt-4">
                                        <!-- FIELDS: key-value pairs -->
                                        @if (panel.displayType === 'fields' && panel.fields) {
                                            <div class="flex flex-col gap-4">
                                                @for (campo of panel.fields; track campo.key) {
                                                    @if (campo.value) {
                                                        <div class="flex flex-col gap-1">
                                                            <label class="font-medium text-sm text-surface-500">{{ campo.label }}</label>
                                                            <div class="p-3 bg-surface-50 rounded-lg border border-surface-200 text-sm whitespace-pre-wrap">{{ campo.value }}</div>
                                                        </div>
                                                    }
                                                }
                                            </div>
                                        }

                                        <!-- TABLE: array of objects -->
                                        @if (panel.displayType === 'table' && panel.rows && panel.columns) {
                                            @if (panel.rows.length === 0) {
                                                <p class="text-surface-400 text-sm italic">Sin registros</p>
                                            } @else {
                                                <div class="overflow-x-auto">
                                                    <table class="w-full border-collapse">
                                                        <thead>
                                                            <tr>
                                                                @for (col of panel.columns; track col.key) {
                                                                    <th class="text-left p-2 bg-surface-100 font-semibold text-sm border border-surface-200">{{ col.label }}</th>
                                                                }
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            @for (row of panel.rows; track $index) {
                                                                <tr>
                                                                    @for (col of panel.columns; track col.key) {
                                                                        <td class="p-2 text-sm border border-surface-200 align-top">{{ formatCellValue(row[col.key]) }}</td>
                                                                    }
                                                                </tr>
                                                            }
                                                        </tbody>
                                                    </table>
                                                </div>
                                            }
                                        }

                                        <!-- LIST: array of strings -->
                                        @if (panel.displayType === 'list') {
                                            @if (!panel.listItems || panel.listItems.length === 0) {
                                                <p class="text-surface-400 text-sm italic">Sin registros</p>
                                            } @else {
                                                <ul class="list-disc pl-6">
                                                    @for (item of panel.listItems; track $index) {
                                                        <li class="py-1 text-sm">{{ item }}</li>
                                                    }
                                                </ul>
                                            }
                                        }

                                        <!-- INFO: solo conteo -->
                                        @if (panel.displayType === 'info') {
                                            <p class="text-surface-500 text-sm italic">{{ panel.infoText }}</p>
                                        }
                                    </div>
                                </p-accordion-content>
                            </p-accordion-panel>
                        }
                    </p-accordion>
                </p-card>
            }
        </div>

        <app-comment-thread
            [estudianteId]="estudianteId"
            [seccionCodigo]="seccionCodigo"
            [subseccionCodigo]="subseccionActiva"
            [readOnly]="false"
            [(visible)]="comentariosVisible"
            (comentarioAgregado)="onComentarioAgregado()" />
    `
})
export class TutorRevisionSeccion implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private tutorReviewService = inject(TutorReviewService);
    private estadoTutorService = inject(EstadoTutorSubseccionService);
    private comentarioService = inject(ComentarioSubseccionService);

    estudianteId = 0;
    seccionCodigo = '';
    seccionNombre = '';
    cargando = signal(true);
    paneles = signal<PanelView[]>([]);
    panelValues: string[] = [];
    estadosTutor = signal<EstadoTutorSubseccionDTO[]>([]);
    comentariosCounts = signal<Record<string, number>>({});
    comentariosVisible = false;
    subseccionActiva = '';
    getSeverity = getSeverityByEstado;
    getLabel = getLabelByEstado;

    ngOnInit(): void {
        this.estudianteId = Number(this.route.snapshot.paramMap.get('estudianteId'));
        this.seccionCodigo = this.route.snapshot.paramMap.get('seccionCodigo') || '';
        this.seccionNombre = this.getNombreSeccion(this.seccionCodigo);
        this.cargarDatos();
    }

    private cargarDatos(): void {
        this.tutorReviewService.obtenerRespuestasEstudiante(this.estudianteId, this.seccionCodigo).subscribe({
            next: (respuesta) => {
                this.construirPaneles(respuesta?.datos || {});
                this.cargando.set(false);
            },
            error: () => {
                this.construirPaneles({});
                this.cargando.set(false);
            }
        });

        this.estadoTutorService.obtenerEstadosPorSeccion(this.estudianteId, this.seccionCodigo).subscribe({
            next: (estados) => this.estadosTutor.set(estados)
        });

        this.comentarioService.obtenerConteoPorSeccion(this.estudianteId, this.seccionCodigo).subscribe({
            next: (conteo) => this.comentariosCounts.set(conteo)
        });
    }

    private construirPaneles(datos: any): void {
        const seccionLabels = BITACORA_LABELS[this.seccionCodigo] || {};
        const panelesResult: PanelView[] = [];

        if (typeof datos !== 'object' || datos === null) {
            this.paneles.set([]);
            return;
        }

        Object.keys(datos).forEach(panelKey => {
            const panelData = datos[panelKey];
            const meta: PanelMeta | undefined = seccionLabels[panelKey];
            const panelLabel = meta?.panelLabel || panelKey;
            const displayType = meta?.displayType || this.inferDisplayType(panelData);

            const panel: PanelView = {
                key: panelKey,
                label: panelLabel,
                displayType
            };

            switch (displayType) {
                case 'table':
                    panel.columns = meta?.columns || this.inferColumns(panelData);
                    if (panelKey === 'contenidos' && !Array.isArray(panelData) && panelData?.topics) {
                        panel.rows = this.flattenContenidos(panelData);
                    } else {
                        panel.rows = Array.isArray(panelData) ? panelData : [];
                    }
                    break;

                case 'list':
                    panel.listItems = this.extractListItems(panelData);
                    break;

                case 'info':
                    const count = typeof panelData === 'object' && panelData?.count != null
                        ? panelData.count
                        : (Array.isArray(panelData) ? panelData.length : 0);
                    panel.infoText = `${count} ${meta?.infoLabel || 'registros'}`;
                    break;

                case 'fields':
                default:
                    panel.fields = this.buildFieldViews(panelKey, panelData, meta);
                    break;
            }

            panelesResult.push(panel);
            this.panelValues.push(panelKey);
        });

        this.paneles.set(panelesResult);
    }

    /** Determina cómo mostrar un panel basado en la estructura de sus datos */
    private inferDisplayType(data: any): 'fields' | 'table' | 'list' | 'info' {
        if (Array.isArray(data)) {
            if (data.length === 0) return 'table';
            if (typeof data[0] === 'string') return 'list';
            if (typeof data[0] === 'object') return 'table';
        }
        if (typeof data === 'object' && data !== null) {
            // Si tiene solo 'count', es info
            const keys = Object.keys(data);
            if (keys.length === 1 && keys[0] === 'count') return 'info';
            return 'fields';
        }
        return 'fields';
    }

    /** Infiere columnas de tabla a partir del primer elemento del array */
    private inferColumns(data: any): { key: string; label: string }[] {
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
            return Object.keys(data[0]).map(key => ({ key, label: key }));
        }
        return [];
    }

    /** Extrae items de lista (array de strings o FormArray serializado) */
    private extractListItems(data: any): string[] {
        if (Array.isArray(data)) {
            return data.map(item => typeof item === 'string' ? item : this.formatAnyValue(item));
        }
        return [];
    }

    /** Construye la lista de campos con sus valores formateados */
    private buildFieldViews(panelKey: string, panelData: any, meta?: PanelMeta): { key: string; label: string; value: string }[] {
        if (typeof panelData !== 'object' || panelData === null || Array.isArray(panelData)) {
            return [];
        }

        const fieldLabels = meta?.fields || {};
        const result: { key: string; label: string; value: string }[] = [];

        // Si hay campos definidos en meta, usar ese orden; sino usar las keys del dato
        const keys = Object.keys(fieldLabels).length > 0
            ? Object.keys(fieldLabels)
            : Object.keys(panelData);

        for (const key of keys) {
            if (!(key in panelData)) continue;
            const rawValue = panelData[key];
            // Omitir campos de control booleanos (otroMedio, otraTecnica, etc.) que son solo toggles
            if (typeof rawValue === 'boolean' && !fieldLabels[key]) continue;

            const label = fieldLabels[key] || key;
            const value = this.formatAnyValue(rawValue);

            // No agregar si el valor es vacío/nulo y no tiene label definido
            if (!value && !fieldLabels[key]) continue;

            result.push({ key, label, value });
        }

        // Si hay keys en panelData que no estaban en fieldLabels, agregarlas al final
        if (Object.keys(fieldLabels).length > 0) {
            for (const key of Object.keys(panelData)) {
                if (key in fieldLabels) continue; // ya procesada
                const rawValue = panelData[key];
                if (typeof rawValue === 'boolean') continue; // skip toggles
                const value = this.formatAnyValue(rawValue);
                if (!value) continue;
                result.push({ key, label: key, value });
            }
        }

        return result;
    }

    /** Formatea cualquier valor para mostrarlo como texto legible */
    formatAnyValue(val: any): string {
        if (val === null || val === undefined || val === '') return '';

        // Boolean
        if (typeof val === 'boolean') return val ? 'Sí' : 'No';

        // Number
        if (typeof val === 'number') return val.toString();

        // String → buscar en SELECT_VALUE_LABELS
        if (typeof val === 'string') {
            return SELECT_VALUE_LABELS[val] || val;
        }

        // Array
        if (Array.isArray(val)) {
            if (val.length === 0) return '';
            // Array de strings
            if (typeof val[0] === 'string') {
                return val.map(v => SELECT_VALUE_LABELS[v] || v).join(', ');
            }
            // Array de objects con .name
            if (typeof val[0] === 'object' && val[0]?.name) {
                return val.map((v: any) => v.name).join(', ');
            }
            // Array de objects con .label
            if (typeof val[0] === 'object' && val[0]?.label) {
                return val.map((v: any) => v.label).join(', ');
            }
            // Array de objects con .value
            if (typeof val[0] === 'object' && val[0]?.value && !val[0]?.name && !val[0]?.label) {
                return val.map((v: any) => SELECT_VALUE_LABELS[v.value] || v.value).join(', ');
            }
            return val.map((v: any) => this.formatAnyValue(v)).join(', ');
        }

        // Object con .name (selects de p-select/p-autoComplete)
        if (typeof val === 'object' && val.name) {
            return val.name;
        }

        // Object con .label
        if (typeof val === 'object' && val.label) {
            return val.label;
        }

        // Object genérico: mostrar sus valores
        if (typeof val === 'object') {
            const entries = Object.entries(val)
                .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false)
                .map(([k, v]) => {
                    const formatted = this.formatAnyValue(v);
                    return formatted ? `${k}: ${formatted}` : null;
                })
                .filter(Boolean);
            return entries.join(' | ');
        }

        return String(val);
    }

    /** Formatea un valor de celda de tabla */
    formatCellValue(val: any): string {
        return this.formatAnyValue(val) || '-';
    }

    getEstadoTutor(subseccionCodigo: string): EstadoAvance {
        const estado = this.estadosTutor().find(e => e.subseccionCodigo === subseccionCodigo);
        return (estado?.estado as EstadoAvance) || 'sin_avances';
    }

    getComentarioCount(subseccionCodigo: string): string {
        const count = this.comentariosCounts()[subseccionCodigo] || 0;
        return count > 0 ? count + '' : '';
    }

    abrirComentarios(subseccionCodigo: string): void {
        this.subseccionActiva = subseccionCodigo;
        this.comentariosVisible = true;
    }

    onComentarioAgregado(): void {
        this.comentarioService.obtenerConteoPorSeccion(this.estudianteId, this.seccionCodigo).subscribe({
            next: (conteo) => this.comentariosCounts.set(conteo)
        });
    }

    volver(): void {
        this.router.navigate(['/home/tutor/revision', this.estudianteId]);
    }

    /** Transforma {topics: [...], subtopics: [...]} en filas planas para tabla */
    private flattenContenidos(data: any): any[] {
        const topics: any[] = data.topics || [];
        const subtopics: any[] = data.subtopics || [];
        const rows: any[] = [];

        for (const topic of topics) {
            const topicSubs = subtopics.filter((s: any) => s.topicId === topic.id);
            if (topicSubs.length === 0) {
                rows.push({ tema: topic.name, subtema: '-' });
            } else {
                for (const sub of topicSubs) {
                    rows.push({ tema: topic.name, subtema: sub.name });
                }
            }
        }

        return rows;
    }

    private getNombreSeccion(codigo: string): string {
        const nombres: Record<string, string> = {
            'caracteriza': 'Caracteriza tu Asignatura',
            'factores': 'Factores Situacionales',
            'ajustes': 'Ambientes Sanos y Seguros',
            'rap-rac': 'RAP y RAC',
            'actividades': 'Actividades de Aprendizaje',
            'evaluacion': 'Cómo Evaluaré',
            'secuencia': 'Secuencia del Curso',
            'bibliografia': 'Bibliografía'
        };
        return nombres[codigo] || codigo;
    }
}
