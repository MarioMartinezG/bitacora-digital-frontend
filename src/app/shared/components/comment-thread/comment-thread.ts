import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ComentarioSubseccionService } from '../../../core/services/comentario-subseccion.service';
import { ComentarioSubseccionDTO } from '../../../core/models/comentario-subseccion.model';

@Component({
    selector: 'app-comment-thread',
    standalone: true,
    imports: [CommonModule, FormsModule, DrawerModule, ButtonModule, TextareaModule, AvatarModule, TagModule, TooltipModule],
    template: `
        <p-drawer [(visible)]="visible" (visibleChange)="visibleChange.emit($event)" position="right" [style]="{width: '30rem'}">
            <ng-template pTemplate="header">
                <div class="flex items-center gap-2 w-full">
                    <i class="pi pi-comments text-xl"></i>
                    <span class="font-semibold text-lg">Comentarios</span>
                    <p-tag [value]="comentarios().length + ''" severity="info" styleClass="ml-2" />
                    @if (resueltos() > 0) {
                        <p-tag [value]="resueltos() + ' resueltos'" severity="success" styleClass="ml-1" />
                    }
                </div>
            </ng-template>

            <div class="flex flex-col gap-3">
                @if (comentarios().length === 0) {
                    <div class="text-center text-surface-500 py-8">
                        <i class="pi pi-comments text-4xl mb-3 block"></i>
                        <p>No hay comentarios aún</p>
                    </div>
                }

                @for (comentario of comentarios(); track comentario.id) {
                    <div class="p-3 rounded-lg border"
                         [style.border-color]="comentario.resuelto ? 'var(--green-300)' : 'var(--surface-border)'"
                         [style.background-color]="comentario.resuelto ? 'var(--green-50)' : 'var(--surface-50)'">

                        <!-- Cabecera: avatar + tutor + fecha -->
                        <div class="flex items-start gap-3">
                            <p-avatar [label]="comentario.nombreTutor.charAt(0).toUpperCase()" shape="circle" size="normal" />
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="font-semibold text-sm">{{ comentario.nombreTutor }}</span>
                                    <span class="text-xs text-surface-400">{{ comentario.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</span>
                                </div>
                                <p class="m-0 text-sm whitespace-pre-wrap">{{ comentario.comentario }}</p>
                            </div>
                        </div>

                        <!-- Pie: estado de resolución -->
                        <div class="flex items-center justify-between mt-3 pt-2"
                             style="border-top: 1px solid var(--surface-border);">
                            <div class="flex items-center gap-2">
                                @if (comentario.resuelto) {
                                    <i class="pi pi-check-circle text-green-500 text-sm"></i>
                                    <span class="text-xs text-green-600 font-medium">Resuelto</span>
                                    <span class="text-xs text-surface-400">
                                        · {{ comentario.fechaResolucion | date:'dd/MM/yyyy HH:mm' }}
                                    </span>
                                } @else {
                                    <i class="pi pi-clock text-orange-400 text-sm"></i>
                                    <span class="text-xs text-orange-500 font-medium">Pendiente</span>
                                }
                            </div>

                            <!-- Botón solo visible para el estudiante (readOnly=true) -->
                            @if (readOnly) {
                                <p-button
                                    [label]="comentario.resuelto ? 'Marcar pendiente' : 'Marcar resuelto'"
                                    [icon]="comentario.resuelto ? 'pi pi-times-circle' : 'pi pi-check-circle'"
                                    [severity]="comentario.resuelto ? 'secondary' : 'success'"
                                    [outlined]="true"
                                    size="small"
                                    [loading]="resolviendoId() === comentario.id"
                                    (onClick)="toggleResuelto(comentario)" />
                            }
                        </div>
                    </div>
                }
            </div>

            @if (!readOnly) {
                <ng-template pTemplate="footer">
                    <div class="flex flex-col gap-2">
                        <textarea pTextarea [(ngModel)]="nuevoComentario" rows="3"
                                  placeholder="Escribe un comentario..." class="w-full"></textarea>
                        <p-button label="Enviar comentario" icon="pi pi-send"
                                  (onClick)="enviarComentario()"
                                  [disabled]="!nuevoComentario.trim()"
                                  [loading]="enviando()" class="w-full" />
                    </div>
                </ng-template>
            }
        </p-drawer>
    `
})
export class CommentThreadComponent implements OnChanges {
    private comentarioService = inject(ComentarioSubseccionService);

    @Input() estudianteId!: number;
    @Input() seccionCodigo!: string;
    @Input() subseccionCodigo!: string;
    @Input() readOnly = true;
    @Input() visible = false;

    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() comentarioAgregado = new EventEmitter<void>();

    comentarios = signal<ComentarioSubseccionDTO[]>([]);
    enviando = signal(false);
    resolviendoId = signal<number | null>(null);
    nuevoComentario = '';

    resueltos = () => this.comentarios().filter(c => c.resuelto).length;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible'] && this.visible && this.estudianteId && this.seccionCodigo && this.subseccionCodigo) {
            this.cargarComentarios();
        }
    }

    cargarComentarios(): void {
        this.comentarioService.obtenerComentarios(this.estudianteId, this.seccionCodigo, this.subseccionCodigo)
            .subscribe({
                next: (data) => this.comentarios.set(data.reverse()),
                error: () => this.comentarios.set([])
            });
    }

    toggleResuelto(comentario: ComentarioSubseccionDTO): void {
        this.resolviendoId.set(comentario.id);
        this.comentarioService.toggleResuelto(comentario.id).subscribe({
            next: (actualizado) => {
                this.comentarios.update(list =>
                    list.map(c => c.id === actualizado.id ? actualizado : c)
                );
                this.resolviendoId.set(null);
            },
            error: () => this.resolviendoId.set(null)
        });
    }

    enviarComentario(): void {
        if (!this.nuevoComentario.trim()) return;

        this.enviando.set(true);
        this.comentarioService.crearComentario({
            estudianteId: this.estudianteId,
            seccionCodigo: this.seccionCodigo,
            subseccionCodigo: this.subseccionCodigo,
            comentario: this.nuevoComentario.trim()
        }).subscribe({
            next: (nuevo) => {
                this.comentarios.update(list => [...list, nuevo]);
                this.nuevoComentario = '';
                this.enviando.set(false);
                this.comentarioAgregado.emit();
            },
            error: () => this.enviando.set(false)
        });
    }
}
