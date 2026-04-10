import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ConfiguracionService, ConfiguracionNotificacionDTO } from '../../../core/services/configuracion.service';
import { ToastService } from '../../../core/services';

interface ConfigItem {
    clave: string;
    valor: string;
    dirty: boolean;
}

@Component({
    selector: 'app-configuracion-alertas',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputNumberModule, InputTextModule, ToggleSwitchModule, DividerModule, TagModule],
    template: `
        <div class="flex flex-col gap-4">
            <!-- Header -->
            <div class="flex items-center gap-3">
                <i class="pi pi-bell text-primary text-2xl"></i>
                <h3 class="m-0">Configuraci&oacute;n de Alertas</h3>
            </div>

            @if (cargando()) {
                <div class="flex justify-center p-8">
                    <i class="pi pi-spin pi-spinner text-4xl"></i>
                </div>
            } @else {
                <!-- Canales de notificaci&oacute;n -->
                <div class="card">
                    <div class="flex items-center gap-2 mb-4">
                        <i class="pi pi-send text-primary"></i>
                        <h4 class="m-0">Canales de notificaci&oacute;n</h4>
                    </div>
                    <p class="text-sm text-surface-500 mt-0 mb-4">
                        Activa o desactiva los canales por los cuales se env&iacute;an las notificaciones a los estudiantes.
                    </p>

                    <div class="flex flex-col gap-4">
                        <!-- Email -->
                        <div class="flex items-center justify-between p-3 bg-surface-50 rounded-lg border border-surface-200">
                            <div class="flex items-center gap-3">
                                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
                                    <i class="pi pi-envelope text-lg"></i>
                                </div>
                                <div>
                                    <div class="font-medium">Notificaciones por correo</div>
                                    <div class="text-sm text-surface-500">Env&iacute;a alertas al correo electr&oacute;nico del estudiante</div>
                                </div>
                            </div>
                            <p-toggleswitch [(ngModel)]="emailHabilitado" (onChange)="marcarDirty('EMAIL_HABILITADO')" />
                        </div>

                        <!-- WebSocket -->
                        <div class="flex items-center justify-between p-3 bg-surface-50 rounded-lg border border-surface-200">
                            <div class="flex items-center gap-3">
                                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
                                    <i class="pi pi-bolt text-lg"></i>
                                </div>
                                <div>
                                    <div class="font-medium">Notificaciones en tiempo real</div>
                                    <div class="text-sm text-surface-500">Muestra alertas instant&aacute;neas en la interfaz del estudiante</div>
                                </div>
                            </div>
                            <p-toggleswitch [(ngModel)]="websocketHabilitado" (onChange)="marcarDirty('WEBSOCKET_HABILITADO')" />
                        </div>
                    </div>
                </div>

                <!-- Umbrales y reglas -->
                <div class="card">
                    <div class="flex items-center gap-2 mb-4">
                        <i class="pi pi-sliders-h text-primary"></i>
                        <h4 class="m-0">Umbrales y reglas</h4>
                    </div>
                    <p class="text-sm text-surface-500 mt-0 mb-4">
                        Configura los criterios que disparan las notificaciones autom&aacute;ticas.
                    </p>

                    <div class="flex flex-col gap-4">
                        <!-- Umbral de progreso -->
                        <div class="p-3 bg-surface-50 rounded-lg border border-surface-200">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600">
                                    <i class="pi pi-chart-line text-lg"></i>
                                </div>
                                <div>
                                    <div class="font-medium">Umbral de progreso</div>
                                    <div class="text-sm text-surface-500">Notifica al tutor cuando un estudiante alcance este porcentaje</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 ml-13">
                                <p-inputnumber [(ngModel)]="umbralProgreso" [min]="0" [max]="100" suffix="%" [style]="{width: '8rem'}" (onInput)="marcarDirty('UMBRAL_PROGRESO_NOTIFICACION')" />
                                <p-tag [value]="umbralProgreso + '%'" [severity]="umbralProgreso >= 80 ? 'success' : umbralProgreso >= 50 ? 'warn' : 'danger'" />
                            </div>
                        </div>

                        <!-- D&iacute;as de anticipaci&oacute;n -->
                        <div class="p-3 bg-surface-50 rounded-lg border border-surface-200">
                            <div class="flex items-center gap-3 mb-3">
                                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600">
                                    <i class="pi pi-calendar-clock text-lg"></i>
                                </div>
                                <div>
                                    <div class="font-medium">D&iacute;as de anticipaci&oacute;n para vencimientos</div>
                                    <div class="text-sm text-surface-500">D&iacute;as antes del vencimiento en que se env&iacute;a recordatorio (separados por coma)</div>
                                </div>
                            </div>
                            <div class="flex items-center gap-3 ml-13">
                                <input pInputText [(ngModel)]="diasAnticipacion" [style]="{width: '12rem'}" placeholder="ej: 7,3,1" (input)="marcarDirty('DIAS_ANTICIPACION_VENCIMIENTO')" />
                                <div class="flex gap-1">
                                    @for (dia of getDiasArray(); track dia) {
                                        <p-tag [value]="dia + (dia === '1' ? ' d\u00EDa' : ' d\u00EDas')" severity="warn" />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Programaci&oacute;n -->
                <div class="card">
                    <div class="flex items-center gap-2 mb-4">
                        <i class="pi pi-clock text-primary"></i>
                        <h4 class="m-0">Programaci&oacute;n</h4>
                    </div>
                    <p class="text-sm text-surface-500 mt-0 mb-4">
                        Define cu&aacute;ndo se ejecutan las verificaciones autom&aacute;ticas.
                    </p>

                    <div class="p-3 bg-surface-50 rounded-lg border border-surface-200">
                        <div class="flex items-center gap-3 mb-3">
                            <div class="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 text-cyan-600">
                                <i class="pi pi-stopwatch text-lg"></i>
                            </div>
                            <div>
                                <div class="font-medium">Hora de ejecuci&oacute;n del scheduler</div>
                                <div class="text-sm text-surface-500">Hora diaria en que se verifican vencimientos y se env&iacute;an alertas</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-3 ml-13">
                            <input pInputText [(ngModel)]="horaScheduler" [style]="{width: '8rem'}" placeholder="HH:mm" (input)="marcarDirty('HORA_EJECUCION_SCHEDULER')" />
                            <span class="text-sm text-surface-400">Formato 24h (ej: 08:00)</span>
                        </div>
                    </div>
                </div>

                <!-- Bot&oacute;n guardar -->
                <div class="flex justify-end">
                    <p-button
                        label="Guardar configuraci&oacute;n"
                        icon="pi pi-save"
                        (onClick)="guardar()"
                        [loading]="guardando()"
                        [disabled]="camposDirty.size === 0" />
                </div>
            }
        </div>
    `
})
export class ConfiguracionAlertas implements OnInit {
    private configService = inject(ConfiguracionService);
    private toastService = inject(ToastService);

    cargando = signal(true);
    guardando = signal(false);
    camposDirty = new Set<string>();

    // Valores de configuraci&oacute;n
    umbralProgreso = 80;
    diasAnticipacion = '7,3,1';
    emailHabilitado = true;
    websocketHabilitado = true;
    horaScheduler = '08:00';

    ngOnInit(): void {
        this.configService.obtenerConfiguraciones().subscribe({
            next: (configs) => {
                for (const c of configs) {
                    switch (c.clave) {
                        case 'UMBRAL_PROGRESO_NOTIFICACION':
                            this.umbralProgreso = parseInt(c.valor) || 80;
                            break;
                        case 'DIAS_ANTICIPACION_VENCIMIENTO':
                            this.diasAnticipacion = c.valor || '7,3,1';
                            break;
                        case 'EMAIL_HABILITADO':
                            this.emailHabilitado = c.valor === 'true';
                            break;
                        case 'WEBSOCKET_HABILITADO':
                            this.websocketHabilitado = c.valor === 'true';
                            break;
                        case 'HORA_EJECUCION_SCHEDULER':
                            this.horaScheduler = c.valor || '08:00';
                            break;
                    }
                }
                this.cargando.set(false);
            },
            error: () => this.cargando.set(false)
        });
    }

    marcarDirty(clave: string): void {
        this.camposDirty.add(clave);
    }

    getDiasArray(): string[] {
        return this.diasAnticipacion
            .split(',')
            .map(d => d.trim())
            .filter(d => d.length > 0);
    }

    guardar(): void {
        this.guardando.set(true);
        const updates: { clave: string; valor: string }[] = [];

        if (this.camposDirty.has('UMBRAL_PROGRESO_NOTIFICACION')) {
            updates.push({ clave: 'UMBRAL_PROGRESO_NOTIFICACION', valor: this.umbralProgreso.toString() });
        }
        if (this.camposDirty.has('DIAS_ANTICIPACION_VENCIMIENTO')) {
            updates.push({ clave: 'DIAS_ANTICIPACION_VENCIMIENTO', valor: this.diasAnticipacion });
        }
        if (this.camposDirty.has('EMAIL_HABILITADO')) {
            updates.push({ clave: 'EMAIL_HABILITADO', valor: this.emailHabilitado.toString() });
        }
        if (this.camposDirty.has('WEBSOCKET_HABILITADO')) {
            updates.push({ clave: 'WEBSOCKET_HABILITADO', valor: this.websocketHabilitado.toString() });
        }
        if (this.camposDirty.has('HORA_EJECUCION_SCHEDULER')) {
            updates.push({ clave: 'HORA_EJECUCION_SCHEDULER', valor: this.horaScheduler });
        }

        if (updates.length === 0) {
            this.guardando.set(false);
            return;
        }

        let completados = 0;
        let errores = 0;

        for (const update of updates) {
            this.configService.actualizarConfiguracion(update.clave, update.valor).subscribe({
                next: () => {
                    completados++;
                    if (completados + errores === updates.length) {
                        this.guardando.set(false);
                        this.camposDirty.clear();
                        if (errores === 0) {
                            this.toastService.showSuccess('Configuraci\u00f3n', 'Configuraci\u00f3n guardada exitosamente');
                        } else {
                            this.toastService.showError('Error', `${errores} configuraci\u00f3n(es) no se pudieron guardar`);
                        }
                    }
                },
                error: () => {
                    errores++;
                    if (completados + errores === updates.length) {
                        this.guardando.set(false);
                        this.toastService.showError('Error', 'Error al guardar la configuraci\u00f3n');
                    }
                }
            });
        }
    }
}
