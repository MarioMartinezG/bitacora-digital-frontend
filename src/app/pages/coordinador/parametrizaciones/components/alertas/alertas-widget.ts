import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';
import { ConfiguracionService } from '../../../../../core/services/configuracion.service';

const CLAVE_UMBRALES = 'UMBRALES_COMPLETITUD_COORDINADOR';
const CLAVE_DIAS_DEMORA = 'DIAS_DEMORA_COORDINADOR';
const CLAVE_DIAS_RIESGO = 'DIAS_ANTICIPACION_RIESGO_COORDINADOR';
const CLAVE_PORCENTAJE_RIESGO = 'PORCENTAJE_MINIMO_RIESGO_COORDINADOR';

@Component({
  selector: 'app-alertas-widget',
  templateUrl: './alertas-widget.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    SkeletonModule
  ],
  providers: [MessageService]
})
export class AlertasWidget implements OnInit {

  cargandoAlertas = signal(false);
  guardandoUmbrales = signal(false);
  guardandoDemora = signal(false);
  guardandoRiesgo = signal(false);

  umbralesCompletitud: number[] = [];
  nuevoUmbral: string = '';

  diasDemora: number[] = [];
  nuevoDia: string = '';

  diasAnticipacionRiesgo: string = '';
  porcentajeMinimoRiesgo: string = '';

  constructor(
    private configuracionService: ConfiguracionService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarAlertas();
  }

  cargarAlertas(): void {
    this.cargandoAlertas.set(true);
    this.configuracionService.obtenerConfiguraciones().subscribe({
      next: (configs) => {
        for (const c of configs) {
          if (c.clave === CLAVE_UMBRALES) {
            this.umbralesCompletitud = this.parseLista(c.valor);
          }
          if (c.clave === CLAVE_DIAS_DEMORA) {
            this.diasDemora = this.parseLista(c.valor);
          }
          if (c.clave === CLAVE_DIAS_RIESGO) {
            this.diasAnticipacionRiesgo = c.valor ?? '';
          }
          if (c.clave === CLAVE_PORCENTAJE_RIESGO) {
            this.porcentajeMinimoRiesgo = c.valor ?? '';
          }
        }
        this.cargandoAlertas.set(false);
      },
      error: () => this.cargandoAlertas.set(false)
    });
  }

  agregarUmbral(): void {
    const val = parseInt(this.nuevoUmbral, 10);
    if (isNaN(val) || val < 1 || val > 100) return;
    if (this.umbralesCompletitud.includes(val)) return;
    this.umbralesCompletitud = [...this.umbralesCompletitud, val].sort((a, b) => a - b);
    this.nuevoUmbral = '';
  }

  removerUmbral(valor: number): void {
    this.umbralesCompletitud = this.umbralesCompletitud.filter(u => u !== valor);
  }

  guardarUmbrales(): void {
    this.guardandoUmbrales.set(true);
    const valor = this.umbralesCompletitud.join(',');
    this.configuracionService.actualizarConfiguracion(CLAVE_UMBRALES, valor).subscribe({
      next: () => {
        this.guardandoUmbrales.set(false);
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Umbrales de completitud actualizados', life: 3000 });
      },
      error: () => {
        this.guardandoUmbrales.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron guardar los umbrales', life: 3000 });
      }
    });
  }

  agregarDia(): void {
    const val = parseInt(this.nuevoDia, 10);
    if (isNaN(val) || val < 1) return;
    if (this.diasDemora.includes(val)) return;
    this.diasDemora = [...this.diasDemora, val].sort((a, b) => b - a);
    this.nuevoDia = '';
  }

  removerDia(valor: number): void {
    this.diasDemora = this.diasDemora.filter(d => d !== valor);
  }

  guardarDiasDemora(): void {
    this.guardandoDemora.set(true);
    const valor = this.diasDemora.join(',');
    this.configuracionService.actualizarConfiguracion(CLAVE_DIAS_DEMORA, valor).subscribe({
      next: () => {
        this.guardandoDemora.set(false);
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Días de demora actualizados', life: 3000 });
      },
      error: () => {
        this.guardandoDemora.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron guardar los días de demora', life: 3000 });
      }
    });
  }

  guardarAlertaRiesgo(): void {
    if (!this.diasAnticipacionRiesgo || !this.porcentajeMinimoRiesgo) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Completa los dos campos para guardar la alerta de riesgo', life: 3000 });
      return;
    }
    this.guardandoRiesgo.set(true);
    const dias$ = this.configuracionService.actualizarConfiguracion(CLAVE_DIAS_RIESGO, this.diasAnticipacionRiesgo);
    const pct$ = this.configuracionService.actualizarConfiguracion(CLAVE_PORCENTAJE_RIESGO, this.porcentajeMinimoRiesgo);
    let completados = 0;
    const onDone = () => {
      completados++;
      if (completados === 2) {
        this.guardandoRiesgo.set(false);
        this.messageService.add({ severity: 'success', summary: 'Guardado', detail: 'Alerta de estudiante en riesgo actualizada', life: 3000 });
      }
    };
    const onError = () => {
      this.guardandoRiesgo.set(false);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la configuración de riesgo', life: 3000 });
    };
    dias$.subscribe({ next: onDone, error: onError });
    pct$.subscribe({ next: onDone, error: onError });
  }

  private parseLista(valor: string): number[] {
    return valor.split(',').map(v => parseInt(v.trim(), 10)).filter(n => !isNaN(n));
  }
}
