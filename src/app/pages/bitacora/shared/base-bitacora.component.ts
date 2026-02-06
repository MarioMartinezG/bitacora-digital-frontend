import { Directive, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { AutoSaveService } from '../../../core/services';
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

  /** Código de la sección de bitácora (debe ser definido por cada componente hijo) */
  protected abstract seccionCodigo: string;

  /** Configuración de secciones para cálculo de progreso */
  protected abstract sectionsConfig: SectionConfig[];

  /** FormGroup principal del componente */
  protected form!: FormGroup;

  /** Estado de carga de datos */
  isLoading = signal(true);

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
    this.loadExistingData();
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
