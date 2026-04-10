import { Injectable, inject, signal, computed } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription, timer, of } from 'rxjs';
import { debounceTime, switchMap, retry, catchError, tap } from 'rxjs/operators';
import { BitacoraService } from './bitacora.service';
import { AutoSaveConfig, SaveState, INITIAL_SAVE_STATE, SaveStatus } from '../models';
import { GuardarSeccionRequest, RespuestaSeccionDTO } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AutoSaveService {
  private bitacoraService = inject(BitacoraService);

  // Estado reactivo usando signals
  private _saveState = signal<SaveState>({ ...INITIAL_SAVE_STATE });

  // Exponer estado como readonly
  readonly saveState = this._saveState.asReadonly();
  readonly status = computed(() => this._saveState().status);
  readonly lastSaved = computed(() => this._saveState().lastSaved);
  readonly isDirty = computed(() => this._saveState().isDirty);
  readonly errorMessage = computed(() => this._saveState().errorMessage);

  // Subject para el debounce del auto-guardado
  private saveSubject = new Subject<{ form: FormGroup; config: AutoSaveConfig }>();
  private saveSubscription: Subscription | null = null;
  private formSubscription: Subscription | null = null;

  constructor() {
    this.initSaveSubscription();
  }

  /**
   * Inicializa la suscripción al subject de guardado con debounce
   */
  private initSaveSubscription(): void {
    this.saveSubscription = this.saveSubject.pipe(
      tap(() => this.updateStatus('pending')),
      debounceTime(2000), // El debounce se aplica aquí
      tap(() => this.updateStatus('saving')),
      switchMap(({ form, config }) => this.performSave(form, config))
    ).subscribe();
  }

  /**
   * Configura el auto-guardado para un formulario
   */
  setupAutoSave(form: FormGroup, config: AutoSaveConfig): void {
    // Limpiar suscripción anterior si existe
    this.cleanupFormSubscription();

    // Suscribirse a cambios del formulario
    this.formSubscription = form.valueChanges.subscribe(() => {
      this._saveState.update(state => ({ ...state, isDirty: true }));
      this.saveSubject.next({ form, config });
    });
  }

  /**
   * Guardado manual inmediato
   */
  saveManually(form: FormGroup, config: AutoSaveConfig): void {
    this.updateStatus('saving');
    this.performSave(form, config).subscribe();
  }

  /**
   * Realiza el guardado con reintentos
   */
  private performSave(form: FormGroup, config: AutoSaveConfig) {
    const maxRetries = config.maxRetries ?? 3;
    const usuarioId = this.bitacoraService.obtenerUsuarioId();
    const progress = config.getProgress?.();

    const request: GuardarSeccionRequest = {
      usuarioId: usuarioId,
      seccionCodigo: config.seccionCodigo,
      datos: form.getRawValue(),
      estadoAvance: progress?.estado ?? this.calcularEstadoAvance(form),
      progresoPorcentaje: progress?.totalPercentage ?? 0
    };

    return this.bitacoraService.guardarSeccion(request).pipe(
      retry({
        count: maxRetries,
        delay: (error, retryCount) => {
          // Backoff exponencial: 1s, 2s, 4s
          const delayMs = Math.pow(2, retryCount - 1) * 1000;
          return timer(delayMs);
        }
      }),
      tap({
        next: () => {
          this._saveState.set({
            status: 'saved',
            lastSaved: new Date(),
            isDirty: false
          });
        },
        error: () => {
          // El error ya fue manejado por catchError
        }
      }),
      catchError(error => {
        this._saveState.set({
          status: 'error',
          lastSaved: this._saveState().lastSaved,
          isDirty: true,
          errorMessage: error?.message || 'Error al guardar'
        });
        return of(null);
      })
    );
  }

  /**
   * Carga datos existentes para una sección
   */
  loadData(seccionCodigo: string) {
    return this.bitacoraService.obtenerSeccion(seccionCodigo).pipe(
      tap({
        next: (respuesta: RespuestaSeccionDTO) => {
          if (respuesta && respuesta.fechaActualizacion) {
            this._saveState.update(state => ({
              ...state,
              lastSaved: new Date(respuesta.fechaActualizacion)
            }));
          }
        }
      }),
      catchError(() => {
        // Si no existe la sección, retornar null (es normal para usuarios nuevos)
        return of(null);
      })
    );
  }

  /**
   * Resetea el estado de guardado
   */
  resetState(): void {
    this._saveState.set({ ...INITIAL_SAVE_STATE });
  }

  /**
   * Limpia suscripciones del formulario
   */
  cleanupFormSubscription(): void {
    this.formSubscription?.unsubscribe();
    this.formSubscription = null;
  }

  /**
   * Limpieza completa al destruir
   */
  cleanup(): void {
    this.cleanupFormSubscription();
    this.saveSubscription?.unsubscribe();
    this.saveSubscription = null;
    this.resetState();
  }

  /**
   * Actualiza solo el status
   */
  private updateStatus(status: SaveStatus): void {
    this._saveState.update(state => ({ ...state, status }));
  }

  /**
   * Calcula el estado de avance basado en el formulario
   */
  private calcularEstadoAvance(form: FormGroup): 'sin_avances' | 'en_desarrollo' | 'completado' {
    const value = form.getRawValue();
    const hasAnyValue = this.hasAnyValue(value);
    const isValid = form.valid;

    if (!hasAnyValue) return 'sin_avances';
    if (isValid) return 'completado';
    return 'en_desarrollo';
  }

  /**
   * Verifica si el objeto tiene algún valor no vacío
   */
  private hasAnyValue(obj: any): boolean {
    if (obj === null || obj === undefined) return false;
    if (typeof obj === 'string') return obj.trim().length > 0;
    if (typeof obj === 'number') return true;
    if (typeof obj === 'boolean') return true;
    if (Array.isArray(obj)) return obj.some(item => this.hasAnyValue(item));
    if (typeof obj === 'object') {
      return Object.values(obj).some(value => this.hasAnyValue(value));
    }
    return false;
  }
}
