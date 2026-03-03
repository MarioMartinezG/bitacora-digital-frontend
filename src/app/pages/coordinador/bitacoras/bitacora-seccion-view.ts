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
import { AuthStateService } from '../../../core/services/auth-state.service';
import { EstadoTutorSubseccionDTO } from '../../../core/models/estado-tutor-subseccion.model';
import { getSeverityByEstado, getLabelByEstado, EstadoAvance, UserRole } from '../../../core/models';
import { BITACORA_LABELS, SELECT_VALUE_LABELS, PanelMeta } from '../../tutor/revision/bitacora-labels';

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

const SECCIONES_NOMBRES: Record<string, string> = {
  'caracteriza': 'Caracteriza tu Asignatura',
  'factores': 'Factores Situacionales',
  'ajustes': 'Ambientes Sanos y Seguros',
  'rap-rac': 'RAP y RAC',
  'actividades': 'Actividades de Aprendizaje',
  'como-evaluare': 'Cómo Evaluaré',
  'secuencia': 'Secuencia del Curso',
  'bibliografia': 'Bibliografía'
};

@Component({
  selector: 'app-bitacora-seccion-view',
  templateUrl: './bitacora-seccion-view.html',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, AccordionModule, CommentThreadComponent, EstadoTutorSelectorComponent]
})
export class BitacoraSeccionView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tutorReviewService = inject(TutorReviewService);
  private estadoTutorService = inject(EstadoTutorSubseccionService);
  private comentarioService = inject(ComentarioSubseccionService);
  private authStateService = inject(AuthStateService);

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

  /** Si el coordinador también es tutor, puede comentar y asignar estados */
  esTambienTutor = false;

  ngOnInit(): void {
    this.estudianteId = Number(this.route.snapshot.paramMap.get('estudianteId'));
    this.seccionCodigo = this.route.snapshot.paramMap.get('seccionCodigo') || '';
    this.seccionNombre = SECCIONES_NOMBRES[this.seccionCodigo] || this.seccionCodigo;
    this.esTambienTutor = this.authStateService.hasRole(UserRole.TUTOR);
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
          panel.listItems = Array.isArray(panelData) ? panelData.map((item: any) => typeof item === 'string' ? item : this.formatAnyValue(item)) : [];
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

  private buildFieldViews(panelKey: string, panelData: any, meta?: PanelMeta): { key: string; label: string; value: string }[] {
    if (typeof panelData !== 'object' || panelData === null || Array.isArray(panelData)) return [];

    const fieldLabels = meta?.fields || {};
    const result: { key: string; label: string; value: string }[] = [];
    const keys = Object.keys(fieldLabels).length > 0 ? Object.keys(fieldLabels) : Object.keys(panelData);

    for (const key of keys) {
      if (!(key in panelData)) continue;
      const rawValue = panelData[key];
      if (typeof rawValue === 'boolean' && !fieldLabels[key]) continue;
      const label = fieldLabels[key] || key;
      const value = this.formatAnyValue(rawValue);
      if (!value && !fieldLabels[key]) continue;
      result.push({ key, label, value });
    }

    if (Object.keys(fieldLabels).length > 0) {
      for (const key of Object.keys(panelData)) {
        if (key in fieldLabels) continue;
        const rawValue = panelData[key];
        if (typeof rawValue === 'boolean') continue;
        const value = this.formatAnyValue(rawValue);
        if (!value) continue;
        result.push({ key, label: key, value });
      }
    }

    return result;
  }

  formatAnyValue(val: any): string {
    if (val === null || val === undefined || val === '') return '';
    if (typeof val === 'boolean') return val ? 'Sí' : 'No';
    if (typeof val === 'number') return val.toString();
    if (typeof val === 'string') return SELECT_VALUE_LABELS[val] || val;
    if (Array.isArray(val)) {
      if (val.length === 0) return '';
      if (typeof val[0] === 'string') return val.map(v => SELECT_VALUE_LABELS[v] || v).join(', ');
      if (typeof val[0] === 'object' && val[0]?.name) return val.map((v: any) => v.name).join(', ');
      if (typeof val[0] === 'object' && val[0]?.label) return val.map((v: any) => v.label).join(', ');
      return val.map((v: any) => this.formatAnyValue(v)).join(', ');
    }
    if (typeof val === 'object' && val.name) return val.name;
    if (typeof val === 'object' && val.label) return val.label;
    if (typeof val === 'object') {
      return Object.entries(val)
        .filter(([, v]) => v !== null && v !== undefined && v !== '' && v !== false)
        .map(([k, v]) => { const f = this.formatAnyValue(v); return f ? `${k}: ${f}` : null; })
        .filter(Boolean).join(' | ');
    }
    return String(val);
  }

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
    this.router.navigate(['/home/coordinador/bitacoras', this.estudianteId]);
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
