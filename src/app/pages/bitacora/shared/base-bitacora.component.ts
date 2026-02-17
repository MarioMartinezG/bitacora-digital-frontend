import { Directive, OnInit, OnDestroy, inject, signal, computed, Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { AutoSaveService } from '../../../core/services';
import { ComentarioSubseccionService } from '../../../core/services/comentario-subseccion.service';
import { EstadoTutorSubseccionService } from '../../../core/services/estado-tutor-subseccion.service';
import { BitacoraService } from '../../../core/services/bitacora.service';
import { EstadoTutorSubseccionDTO } from '../../../core/models/estado-tutor-subseccion.model';
import {
  AutoSaveConfig,
  SaveState,
  SectionProgress,
  ComponentProgress,
  EstadoAvance,
  calcularEstadoAvance,
  getSeverityByEstado,
  getLabelByEstado
} from '../../../core/models';

/**
 * Configuración de una sección para el cálculo de progreso
 */
export interface SectionConfig {
  name: string;
  formGroupName: string;
  fields: string[];
}

/**
 * Clase base abstracta para componentes de bitácora con auto-guardado y progreso
 *
 * Los componentes que extienden esta clase deben:
 * 1. Definir `seccionCodigo` con el código de sección correspondiente (ej: 'factores')
 * 2. Definir `sectionsConfig` con la configuración de secciones
 * 3. Implementar `initForm()` para inicializar el FormGroup
 * 4. Llamar a `super.ngOnInit()` al inicio de su ngOnInit
 * 5. Llamar a `super.ngOnDestroy()` al inicio de su ngOnDestroy
 */
@Directive()
export abstract class BaseBitacoraComponent implements OnInit, OnDestroy {
  protected autoSaveService = inject(AutoSaveService);
  protected comentarioSubseccionService = inject(ComentarioSubseccionService);
  protected estadoTutorSubseccionService = inject(EstadoTutorSubseccionService);
  protected bitacoraService = inject(BitacoraService);

  /** Código de la sección de bitácora (debe ser definido por cada componente hijo) */
  protected abstract seccionCodigo: string;

  /** Configuración de secciones para cálculo de progreso */
  protected abstract sectionsConfig: SectionConfig[];

  /** FormGroup principal del componente */
  protected form!: FormGroup;

  /** Inputs para modo revisión (tutor) */
  @Input() estudianteIdOverride?: number;
  @Input() readOnly = false;

  /** Estado de carga de datos */
  isLoading = signal(true);

  /** Conteo de comentarios por sub-sección */
  comentariosCounts = signal<Record<string, number>>({});

  /** Estados del tutor por sub-sección */
  estadosTutor = signal<EstadoTutorSubseccionDTO[]>([]);

  /** Progreso del componente (reactivo) - protected para permitir override en clases hijas */
  protected _progress = signal<ComponentProgress>({
    sections: [],
    totalPercentage: 0,
    estado: 'sin_avances'
  });

  /** Progreso expuesto como readonly */
  readonly progress = this._progress.asReadonly();

  /** Estado de guardado expuesto para el template */
  get saveState(): SaveState {
    return this.autoSaveService.saveState();
  }

  /** Helpers para usar en templates */
  getSeverity = getSeverityByEstado;
  getLabel = getLabelByEstado;

  ngOnInit(): void {
    this.initForm();
    if (this.readOnly && this.estudianteIdOverride) {
      this.loadForReview(this.estudianteIdOverride);
    } else {
      this.loadExistingData();
      this.loadComentariosCounts();
      this.loadEstadosTutor();
    }
  }

  ngOnDestroy(): void {
    this.autoSaveService.cleanupFormSubscription();
  }

  /**
   * Método abstracto que cada componente debe implementar
   * para inicializar su FormGroup específico
   */
  protected abstract initForm(): void;

  /**
   * Carga datos existentes y configura el auto-guardado
   */
  protected loadExistingData(): void {
    this.isLoading.set(true);

    this.autoSaveService.loadData(this.seccionCodigo).subscribe({
      next: (respuesta) => {
        if (respuesta && respuesta.datos) {
          this.patchFormWithData(respuesta.datos);
        }
        this.setupAutoSave();
        this.setupProgressTracking();
        this.calculateProgress();
        this.isLoading.set(false);
      },
      error: () => {
        this.setupAutoSave();
        this.setupProgressTracking();
        this.calculateProgress();
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Aplica datos cargados al formulario
   */
  protected patchFormWithData(data: any): void {
    this.form.patchValue(data, { emitEvent: false });
  }

  /**
   * Carga datos de un estudiante en modo revisión (readOnly)
   */
  protected loadForReview(estudianteId: number): void {
    this.isLoading.set(true);

    this.bitacoraService.obtenerSeccionPorEstudiante(this.seccionCodigo, estudianteId).subscribe({
      next: (respuesta) => {
        if (respuesta && respuesta.datos) {
          this.patchFormWithData(respuesta.datos);
        }
        this.form.disable();
        this.calculateProgress();
        this.loadComentariosCounts(estudianteId);
        this.loadEstadosTutor(estudianteId);
        this.isLoading.set(false);
      },
      error: () => {
        this.form.disable();
        this.calculateProgress();
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Carga el conteo de comentarios por sub-sección
   */
  protected loadComentariosCounts(estudianteId?: number): void {
    const id = estudianteId || this.bitacoraService.obtenerUsuarioId();
    if (!id) return;

    this.comentarioSubseccionService.obtenerConteoPorSeccion(id, this.seccionCodigo).subscribe({
      next: (conteo) => this.comentariosCounts.set(conteo),
      error: () => {}
    });
  }

  /**
   * Carga los estados del tutor por sub-sección
   */
  protected loadEstadosTutor(estudianteId?: number): void {
    const id = estudianteId || this.bitacoraService.obtenerUsuarioId();
    if (!id) return;

    this.estadoTutorSubseccionService.obtenerEstadosPorSeccion(id, this.seccionCodigo).subscribe({
      next: (estados) => this.estadosTutor.set(estados),
      error: () => {}
    });
  }

  /**
   * Obtiene el estado del tutor para una sub-sección específica
   */
  getEstadoTutor(subseccionCodigo: string): EstadoAvance | undefined {
    const estado = this.estadosTutor().find(e => e.subseccionCodigo === subseccionCodigo);
    return estado?.estado as EstadoAvance | undefined;
  }

  /**
   * Obtiene el estado efectivo para mostrar en el badge de una sub-sección.
   * Prioriza el estado del tutor (si existe) sobre el estado auto-calculado.
   */
  getDisplayEstado(subseccionCodigo: string): EstadoAvance {
    return this.getEstadoTutor(subseccionCodigo)
        || this.getSectionProgress(subseccionCodigo)?.estado
        || 'sin_avances';
  }

  /**
   * Indica si una sub-sección tiene un estado asignado por el tutor
   */
  hasTutorEstado(subseccionCodigo: string): boolean {
    return !!this.getEstadoTutor(subseccionCodigo);
  }

  /**
   * Configura el auto-guardado para el formulario
   */
  protected setupAutoSave(): void {
    const config: AutoSaveConfig = {
      seccionCodigo: this.seccionCodigo,
      debounceTime: 2000,
      maxRetries: 3,
      getProgress: () => this._progress()
    };
    this.autoSaveService.setupAutoSave(this.form, config);
  }

  /**
   * Configura el tracking de progreso al cambiar valores del formulario
   */
  protected setupProgressTracking(): void {
    this.form.valueChanges.subscribe(() => {
      this.calculateProgress();
    });
  }

  /**
   * Calcula el progreso de todas las secciones
   */
  protected calculateProgress(): void {
    const sections: SectionProgress[] = this.sectionsConfig.map(config => {
      return this.calculateSectionProgress(config);
    });

    const totalFields = sections.reduce((sum, s) => sum + s.totalFields, 0);
    const completedFields = sections.reduce((sum, s) => sum + s.completedFields, 0);
    const totalPercentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    this._progress.set({
      sections,
      totalPercentage,
      estado: calcularEstadoAvance(totalPercentage)
    });
  }

  /**
   * Calcula el progreso de una sección específica
   */
  protected calculateSectionProgress(config: SectionConfig): SectionProgress {
    const formGroup = this.form.get(config.formGroupName) as FormGroup;
    if (!formGroup) {
      return {
        sectionName: config.name,
        completedFields: 0,
        totalFields: config.fields.length,
        percentage: 0,
        estado: 'sin_avances'
      };
    }

    let completedFields = 0;
    for (const fieldName of config.fields) {
      const control = formGroup.get(fieldName);
      if (control && this.isFieldCompleted(control)) {
        completedFields++;
      }
    }

    const percentage = config.fields.length > 0
      ? Math.round((completedFields / config.fields.length) * 100)
      : 0;

    return {
      sectionName: config.name,
      completedFields,
      totalFields: config.fields.length,
      percentage,
      estado: calcularEstadoAvance(percentage)
    };
  }

  /**
   * Determina si un campo está completado
   */
  protected isFieldCompleted(control: AbstractControl): boolean {
    const value = control.value;
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;
    if (typeof value === 'object' && value !== null) {
      // Para objetos (como selects que guardan {name, code})
      return Object.keys(value).length > 0;
    }
    return false;
  }

  /**
   * Obtiene el progreso de una sección por nombre
   */
  getSectionProgress(sectionName: string): SectionProgress | undefined {
    return this._progress().sections.find(s => s.sectionName === sectionName);
  }

  /**
   * Guardado manual
   */
  saveManually(): void {
    const config: AutoSaveConfig = {
      seccionCodigo: this.seccionCodigo,
      getProgress: () => this._progress()
    };
    this.autoSaveService.saveManually(this.form, config);
  }

  /**
   * Reintenta el guardado después de un error
   */
  retryOnError(): void {
    this.saveManually();
  }
}
