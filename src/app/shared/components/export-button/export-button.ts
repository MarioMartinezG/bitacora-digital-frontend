import { Component, input, signal, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ExportDataService, PanelView } from '../../services/export-data.service';
import { AuthStateService } from '../../../core/services/auth-state.service';
import { ComponentProgress } from '../../../core/models';

@Component({
    selector: 'app-export-button',
    standalone: true,
    imports: [ButtonModule, DialogModule, TooltipModule],
    templateUrl: './export-button.html'
})
export class ExportButtonComponent {
    seccionCodigo = input.required<string>();
    progress = input.required<ComponentProgress>();
    formData = input.required<any>();

    dialogVisible = signal(false);
    paneles = signal<PanelView[]>([]);

    protected exportDataService = inject(ExportDataService);
    protected authState = inject(AuthStateService);

    seccionNombre = computed(() => this.exportDataService.getNombreSeccion(this.seccionCodigo()));
    canExport = computed(() => this.progress().totalPercentage === 100);

    readonly fechaActual = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

    abrirPreview(): void {
        this.paneles.set(this.exportDataService.buildPanels(this.seccionCodigo(), this.formData()));
        this.dialogVisible.set(true);
    }

    descargarPDF(): void {
        const usuario = this.authState.user();
        const html = this.buildPrintHtml(this.paneles(), this.seccionNombre(), usuario);
        const printWindow = window.open('', '_blank', 'width=1000,height=800');
        if (!printWindow) return;
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); }, 500);
    }

    private buildPrintHtml(paneles: PanelView[], seccionNombre: string, usuario: any): string {
        const useLandscape = paneles.some(p => (p.columns?.length ?? 0) >= 6);
        const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });

        const headerHtml = `
            <div class="doc-header">
                <div class="doc-brand">Bitácora Digital — En sus marcas, listos, RAC!</div>
                <h1>${seccionNombre}</h1>
                ${usuario ? `
                    <div class="doc-meta">
                        <span><strong>Estudiante:</strong> ${usuario.nombre}</span>
                        <span><strong>Correo:</strong> ${usuario.correo}</span>
                    </div>` : ''}
                <div class="doc-date">Exportado el ${fecha}</div>
            </div>
        `;

        const panelesHtml = paneles.map(panel => {
            let contenido = '';

            if (panel.displayType === 'fields' && panel.fields?.length) {
                contenido = `<table class="fields-table">
                    ${panel.fields.map(f => `<tr><td class="field-label">${f.label}</td><td>${f.value || '—'}</td></tr>`).join('')}
                </table>`;
            } else if (panel.displayType === 'table' && panel.columns?.length) {
                const theads = panel.columns.map(c => `<th>${c.label}</th>`).join('');
                const tbody = panel.rows?.length
                    ? panel.rows.map(row => `<tr>${panel.columns!.map(c => `<td>${this.exportDataService.formatValue(row[c.key]) || '—'}</td>`).join('')}</tr>`).join('')
                    : `<tr><td colspan="${panel.columns.length}" class="empty">Sin datos registrados</td></tr>`;
                contenido = `<table class="data-table"><thead><tr>${theads}</tr></thead><tbody>${tbody}</tbody></table>`;
            } else if (panel.displayType === 'list' && panel.listItems?.length) {
                contenido = `<ol>${panel.listItems.map(item => `<li>${item}</li>`).join('')}</ol>`;
            } else if (panel.displayType === 'info') {
                contenido = `<p>${panel.infoText}</p>`;
            } else {
                contenido = '<p class="empty">Sin datos registrados</p>';
            }

            return `<div class="section"><h2>${panel.label}</h2>${contenido}</div>`;
        }).join('');

        return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Bitácora — ${seccionNombre}</title>
    <style>
        @page { size: A4 ${useLandscape ? 'landscape' : 'portrait'}; margin: 2cm; }
        * { box-sizing: border-box; }
        body { font-family: Arial, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; margin: 0; }
        .doc-header { border-bottom: 2px solid #006B3C; margin-bottom: 1.5rem; padding-bottom: 1rem; }
        .doc-brand { font-size: 9pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
        .doc-header h1 { margin: 0 0 0.5rem 0; font-size: 18pt; color: #1e293b; }
        .doc-meta { display: flex; gap: 2rem; font-size: 10pt; color: #475569; margin-bottom: 0.25rem; }
        .doc-date { font-size: 9pt; color: #94a3b8; }
        .section { margin-bottom: 1.5rem; page-break-inside: avoid; }
        .section h2 { font-size: 12pt; color: #006B3C; border-bottom: 1px solid #a7d7be; padding-bottom: 0.25rem; margin: 0 0 0.75rem 0; }
        .fields-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
        .fields-table td { padding: 0.3rem 0.5rem; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
        .field-label { font-weight: 600; color: #475569; width: 240px; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        .data-table th { background: #f1f5f9; font-weight: 600; border: 1px solid #cbd5e1; padding: 0.4rem 0.5rem; text-align: left; }
        .data-table td { border: 1px solid #e2e8f0; padding: 0.4rem 0.5rem; vertical-align: top; }
        ol { padding-left: 1.5rem; margin: 0; }
        ol li { margin-bottom: 0.25rem; }
        .empty { color: #94a3b8; font-style: italic; }
    </style>
</head>
<body>
    ${headerHtml}
    ${panelesHtml}
</body>
</html>`;
    }
}
