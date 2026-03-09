import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AccordionModule } from 'primeng/accordion';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
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
    /** Clave de subsección unificada para comentarios (varios paneles pueden compartir hilo) */
    comentarioKey?: string;
    /** Si es true, no se muestra el botón de comentarios en este panel */
    ocultarComentario?: boolean;
    /** Si es true, no se muestra el selector de estado del tutor en este panel */
    ocultarEstado?: boolean;
}

@Component({
    selector: 'app-tutor-revision-seccion',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, TagModule, AccordionModule, MessageModule, TableModule, InputTextModule, TextareaModule, IconFieldModule, InputIconModule, CommentThreadComponent, EstadoTutorSelectorComponent],
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
                                            @if (!panel.ocultarEstado) {
                                                <div (click)="$event.stopPropagation()">
                                                    <app-estado-tutor-selector
                                                        [estudianteId]="estudianteId"
                                                        [seccionCodigo]="seccionCodigo"
                                                        [subseccionCodigo]="panel.key"
                                                        [estadoActual]="getEstadoInicial(panel)" />
                                                </div>
                                            }
                                            @if (!panel.ocultarComentario) {
                                                <p-button icon="pi pi-comments" [rounded]="true" [text]="true" severity="secondary" [badge]="getComentarioCount(panel.comentarioKey || panel.key)" badgeSeverity="info" (onClick)="abrirComentarios(panel.comentarioKey || panel.key); $event.stopPropagation()" />
                                            }
                                        </div>
                                    </div>
                                </p-accordion-header>
                                <p-accordion-content>
                                    <div class="pt-4">

                                        <!-- FIELDS: key-value pairs -->
                                        @if (panel.displayType === 'fields' && panel.fields) {
                                            @if (panelSinContenido(panel)) {
                                                <p-message severity="info" styleClass="w-full">
                                                    <span>El estudiante aún no ha diligenciado esta sección.</span>
                                                </p-message>
                                            } @else {
                                                <div class="flex flex-col gap-4">
                                                    @for (campo of panel.fields; track campo.key) {
                                                        <div class="flex flex-col gap-1">
                                                            <label class="font-medium text-sm text-surface-500">{{ campo.label }}</label>
                                                            <textarea
                                                                pTextarea
                                                                [value]="campo.value || '—'"
                                                                [autoResize]="true"
                                                                rows="1"
                                                                readonly
                                                                class="w-full"
                                                                style="resize: none;">
                                                            </textarea>
                                                        </div>
                                                    }
                                                </div>
                                            }
                                        }

                                        <!-- TABLE: array of objects -->
                                        @if (panel.displayType === 'table' && panel.rows && panel.columns) {
                                            <p-table
                                                [value]="panel.rows"
                                                [columns]="panel.columns"
                                                [paginator]="panel.rows.length > 10"
                                                [rows]="10"
                                                [rowsPerPageOptions]="[5, 10, 25]"
                                                [globalFilterFields]="getColumnKeys(panel)"
                                                sortMode="multiple"
                                                styleClass="p-datatable-sm p-datatable-striped"
                                                #dt>
                                                <ng-template pTemplate="caption">
                                                    <div class="flex justify-end">
                                                        <p-iconfield>
                                                            <p-inputicon styleClass="pi pi-search" />
                                                            <input
                                                                pInputText
                                                                type="text"
                                                                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                                                                placeholder="Buscar..." />
                                                        </p-iconfield>
                                                    </div>
                                                </ng-template>
                                                <ng-template pTemplate="header" let-columns>
                                                    <tr>
                                                        @for (col of columns; track col.key) {
                                                            <th [pSortableColumn]="col.key" class="whitespace-nowrap">
                                                                {{ col.label }}
                                                                <p-sortIcon [field]="col.key" />
                                                            </th>
                                                        }
                                                    </tr>
                                                </ng-template>
                                                <ng-template pTemplate="body" let-row let-columns="columns">
                                                    <tr>
                                                        @for (col of columns; track col.key) {
                                                            <td class="align-top text-sm">{{ formatCellValue(row[col.key]) }}</td>
                                                        }
                                                    </tr>
                                                </ng-template>
                                                <ng-template pTemplate="emptymessage" let-columns>
                                                    <tr>
                                                        <td [attr.colspan]="columns.length" class="p-0">
                                                            <p-message severity="info" styleClass="w-full">
                                                                <span>El estudiante aún no ha diligenciado esta sección.</span>
                                                            </p-message>
                                                        </td>
                                                    </tr>
                                                </ng-template>
                                            </p-table>
                                        }

                                        <!-- LIST: array of strings -->
                                        @if (panel.displayType === 'list') {
                                            @if (!panel.listItems || panel.listItems.length === 0) {
                                                <p-message severity="info" styleClass="w-full">
                                                    <span>El estudiante aún no ha diligenciado esta sección.</span>
                                                </p-message>
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
        this.panelValues = [];

        if (typeof datos !== 'object' || datos === null) {
            datos = {};
        }

        // Iterar primero sobre los paneles definidos en BITACORA_LABELS (garantiza orden
        // y muestra todos los paneles aunque el estudiante no haya guardado datos aún)
        const labelKeys = Object.keys(seccionLabels);
        const procesados = new Set<string>();

        for (const panelKey of labelKeys) {
            const panelData = datos[panelKey] ?? {};
            this.procesarPanel(panelKey, panelData, seccionLabels, panelesResult);
            procesados.add(panelKey);
        }

        // Agregar paneles extra solo si la sección no tiene labels definidos
        // (evita mostrar campos obsoletos de versiones anteriores del formulario)
        if (labelKeys.length === 0) {
            for (const panelKey of Object.keys(datos)) {
                if (procesados.has(panelKey)) continue;
                this.procesarPanel(panelKey, datos[panelKey], seccionLabels, panelesResult);
            }
        }

        this.paneles.set(panelesResult);
    }

    private procesarPanel(panelKey: string, panelData: any, seccionLabels: any, panelesResult: PanelView[]): void {
        const meta: PanelMeta | undefined = seccionLabels[panelKey];
        const panelLabel = meta?.panelLabel || panelKey;
        const displayType = meta?.displayType || this.inferDisplayType(panelData);

        const panel: PanelView = { key: panelKey, label: panelLabel, displayType, comentarioKey: meta?.comentarioKey, ocultarComentario: meta?.ocultarComentario, ocultarEstado: meta?.ocultarEstado };

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
    }

    /** Determina cómo mostrar un panel basado en la estructura de sus datos */
    private inferDisplayType(data: any): 'fields' | 'table' | 'list' | 'info' {
        if (Array.isArray(data)) {
            if (data.length === 0) return 'table';
            if (typeof data[0] === 'string') return 'list';
            if (typeof data[0] === 'object') return 'table';
        }
        if (typeof data === 'object' && data !== null) {
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

    /** Construye la lista de campos con sus valores formateados.
     *  Siempre incluye los campos definidos en meta, aunque el estudiante no los haya llenado. */
    private buildFieldViews(panelKey: string, panelData: any, meta?: PanelMeta): { key: string; label: string; value: string }[] {
        const fieldLabels = meta?.fields || {};
        const metaKeys = Object.keys(fieldLabels);

        let safeData: Record<string, any>;
        if (typeof panelData === 'object' && panelData !== null && !Array.isArray(panelData)) {
            safeData = panelData;
        } else if (metaKeys.length === 1 && (typeof panelData === 'string' || typeof panelData === 'number')) {
            // Valor escalar: se mapea directamente al único campo definido en meta
            safeData = { [metaKeys[0]]: panelData };
        } else {
            safeData = {};
        }

        const result: { key: string; label: string; value: string }[] = [];

        if (metaKeys.length > 0) {
            // Campos definidos en meta: siempre se muestran aunque estén vacíos
            for (const key of metaKeys) {
                const rawValue = safeData[key] ?? null;
                if (typeof rawValue === 'boolean' && !fieldLabels[key]) continue;
                result.push({
                    key,
                    label: fieldLabels[key] || key,
                    value: this.formatAnyValue(rawValue)
                });
            }
            // Campos extra en datos que no estaban en meta (con valor)
            for (const key of Object.keys(safeData)) {
                if (key in fieldLabels) continue;
                const rawValue = safeData[key];
                if (typeof rawValue === 'boolean') continue;
                const value = this.formatAnyValue(rawValue);
                if (!value) continue;
                result.push({ key, label: key, value });
            }
        } else {
            // Sin meta: usar solo las claves de los datos que tienen valor
            for (const key of Object.keys(safeData)) {
                const rawValue = safeData[key];
                if (typeof rawValue === 'boolean') continue;
                const value = this.formatAnyValue(rawValue);
                if (!value) continue;
                result.push({ key, label: key, value });
            }
        }

        return result;
    }

    /** Indica si un panel de tipo fields no tiene ningún campo con valor */
    panelSinContenido(panel: PanelView): boolean {
        if (panel.displayType !== 'fields' || !panel.fields) return false;
        return panel.fields.every(f => !f.value);
    }

    /** Calcula el estado del estudiante a partir de los datos cargados del panel */
    getEstadoEstudiante(panel: PanelView): EstadoAvance {
        switch (panel.displayType) {
            case 'fields': {
                if (!panel.fields || panel.fields.length === 0) return 'sin_avances';
                const conValor = panel.fields.filter(f => f.value).length;
                if (conValor === 0) return 'sin_avances';
                if (conValor === panel.fields.length) return 'completado';
                return 'en_desarrollo';
            }
            case 'table':
                if (!panel.rows || panel.rows.length === 0) return 'sin_avances';
                return 'completado';
            case 'list':
                if (!panel.listItems || panel.listItems.length === 0) return 'sin_avances';
                return 'completado';
            default:
                return 'sin_avances';
        }
    }

    getColumnKeys(panel: PanelView): string[] {
        return panel.columns?.map(c => c.key) ?? [];
    }

    /** Formatea cualquier valor para mostrarlo como texto legible */
    formatAnyValue(val: any): string {
        if (val === null || val === undefined || val === '') return '';

        if (typeof val === 'boolean') return val ? 'Sí' : 'No';
        if (typeof val === 'number') return val.toString();

        if (typeof val === 'string') {
            return SELECT_VALUE_LABELS[val] || val;
        }

        if (Array.isArray(val)) {
            if (val.length === 0) return '';
            if (typeof val[0] === 'string') {
                return val.map(v => SELECT_VALUE_LABELS[v] || v).join(', ');
            }
            if (typeof val[0] === 'object' && val[0]?.name) {
                return val.map((v: any) => v.name).join(', ');
            }
            if (typeof val[0] === 'object' && val[0]?.label) {
                return val.map((v: any) => v.label).join(', ');
            }
            if (typeof val[0] === 'object' && val[0]?.value && !val[0]?.name && !val[0]?.label) {
                return val.map((v: any) => SELECT_VALUE_LABELS[v.value] || v.value).join(', ');
            }
            return val.map((v: any) => this.formatAnyValue(v)).join(', ');
        }

        if (typeof val === 'object' && val.name) return val.name;
        if (typeof val === 'object' && val.label) return val.label;

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

    /** Retorna el estado del tutor si ya lo asignó; si no, usa el estado del estudiante como valor inicial */
    getEstadoInicial(panel: PanelView): EstadoAvance {
        const estadoTutor = this.estadosTutor().find(e => e.subseccionCodigo === panel.key);
        if (estadoTutor) {
            return estadoTutor.estado as EstadoAvance;
        }
        return this.getEstadoEstudiante(panel);
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
            'caracteriza': 'Identificación de tu curso',
            'factores': 'Factores Situacionales',
            'ajustes': 'Ambientes Sanos y Seguros',
            'rap-rac': 'RAP y RAC',
            'actividades': 'Actividades de Aprendizaje',
            'evaluacion': 'Diseño de la evaluación',
            'secuencia': 'Secuencia del Curso',
            'bibliografia': 'Bibliografía',
            'calificacion': 'Calificación'
        };
        return nombres[codigo] || codigo;
    }
}
