import { Injectable } from '@angular/core';
import { BITACORA_LABELS, SELECT_VALUE_LABELS, PanelMeta } from '../../pages/tutor/revision/bitacora-labels';

export interface PanelView {
    key: string;
    label: string;
    displayType: 'fields' | 'table' | 'list' | 'info';
    fields?: { key: string; label: string; value: string }[];
    rows?: any[];
    columns?: { key: string; label: string }[];
    listItems?: string[];
    infoText?: string;
}

@Injectable({ providedIn: 'root' })
export class ExportDataService {

    getNombreSeccion(codigo: string): string {
        const nombres: Record<string, string> = {
            'observar': 'Observar, registrar y actuar de manera oportuna',
            'caracteriza': 'Identificación de tu curso',
            'factores': 'Factores Situacionales',
            'ajustes': 'Ambientes Sanos y Seguros',
            'rap-rac': 'RAP y RAC',
            'actividades': 'Actividades de Aprendizaje',
            'evaluacion': 'Diseño de la evaluación',
            'secuencia': 'Secuencia y cronograma',
            'bibliografia': 'Medios educativos',
            'calificacion': 'Calificación'
        };
        return nombres[codigo] || codigo;
    }

    buildPanels(seccionCodigo: string, datos: any): PanelView[] {
        const seccionLabels = BITACORA_LABELS[seccionCodigo] || {};
        const panelesResult: PanelView[] = [];

        if (typeof datos !== 'object' || datos === null) {
            datos = {};
        }

        const labelKeys = Object.keys(seccionLabels);
        const procesados = new Set<string>();

        for (const panelKey of labelKeys) {
            const panelData = datos[panelKey] ?? {};
            this.procesarPanel(panelKey, panelData, seccionLabels, panelesResult);
            procesados.add(panelKey);
        }

        // Si no hay labels definidos, mostrar los datos tal cual
        if (labelKeys.length === 0) {
            for (const panelKey of Object.keys(datos)) {
                if (procesados.has(panelKey)) continue;
                this.procesarPanel(panelKey, datos[panelKey], seccionLabels, panelesResult);
            }
        }

        return panelesResult;
    }

    formatValue(val: any): string {
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
            return val.map((v: any) => this.formatValue(v)).join(', ');
        }

        if (typeof val === 'object' && val.name) return val.name;
        if (typeof val === 'object' && val.label) return val.label;

        if (typeof val === 'object') {
            const entries = Object.entries(val)
                .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false)
                .map(([k, v]) => {
                    const formatted = this.formatValue(v);
                    return formatted ? `${k}: ${formatted}` : null;
                })
                .filter(Boolean);
            return entries.join(' | ');
        }

        return String(val);
    }

    private procesarPanel(panelKey: string, panelData: any, seccionLabels: any, panelesResult: PanelView[]): void {
        const meta: PanelMeta | undefined = seccionLabels[panelKey];
        const panelLabel = meta?.panelLabel || panelKey;
        const displayType = meta?.displayType || this.inferDisplayType(panelData);

        const panel: PanelView = { key: panelKey, label: panelLabel, displayType };

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

            case 'info': {
                const count = typeof panelData === 'object' && panelData?.count != null
                    ? panelData.count
                    : (Array.isArray(panelData) ? panelData.length : 0);
                panel.infoText = `${count} ${meta?.infoLabel || 'registros'}`;
                break;
            }

            case 'fields':
            default:
                panel.fields = this.buildFieldViews(panelKey, panelData, meta);
                break;
        }

        panelesResult.push(panel);
    }

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

    private inferColumns(data: any): { key: string; label: string }[] {
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
            return Object.keys(data[0]).map(key => ({ key, label: key }));
        }
        return [];
    }

    private extractListItems(data: any): string[] {
        if (Array.isArray(data)) {
            return data.map(item => typeof item === 'string' ? item : this.formatValue(item));
        }
        return [];
    }

    private buildFieldViews(_panelKey: string, panelData: any, meta?: PanelMeta): { key: string; label: string; value: string }[] {
        const fieldLabels = meta?.fields || {};
        const metaKeys = Object.keys(fieldLabels);

        let safeData: Record<string, any>;
        if (typeof panelData === 'object' && panelData !== null && !Array.isArray(panelData)) {
            safeData = panelData;
        } else if (metaKeys.length === 1 && (typeof panelData === 'string' || typeof panelData === 'number')) {
            safeData = { [metaKeys[0]]: panelData };
        } else {
            safeData = {};
        }

        const result: { key: string; label: string; value: string }[] = [];

        if (metaKeys.length > 0) {
            for (const key of metaKeys) {
                const rawValue = safeData[key] ?? null;
                if (typeof rawValue === 'boolean' && !fieldLabels[key]) continue;
                result.push({
                    key,
                    label: fieldLabels[key] || key,
                    value: this.formatValue(rawValue)
                });
            }
            for (const key of Object.keys(safeData)) {
                if (key in fieldLabels) continue;
                const rawValue = safeData[key];
                if (typeof rawValue === 'boolean') continue;
                const value = this.formatValue(rawValue);
                if (!value) continue;
                result.push({ key, label: key, value });
            }
        } else {
            for (const key of Object.keys(safeData)) {
                const rawValue = safeData[key];
                if (typeof rawValue === 'boolean') continue;
                const value = this.formatValue(rawValue);
                if (!value) continue;
                result.push({ key, label: key, value });
            }
        }

        return result;
    }

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
}
