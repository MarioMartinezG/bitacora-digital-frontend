import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';
import { ComentarioSubseccionService } from '../../../core/services/comentario-subseccion.service';
import { ComentarioSubseccionDTO } from '../../../core/models/comentario-subseccion.model';

@Component({
    selector: 'app-comment-thread',
    standalone: true,
    imports: [CommonModule, FormsModule, DrawerModule, ButtonModule, TextareaModule, AvatarModule, TagModule],
    template: `
        <p-drawer [(visible)]="visible" (visibleChange)="visibleChange.emit($event)" position="right" [style]="{width: '28rem'}">
            <ng-template pTemplate="header">
                <div class="flex items-center gap-2">
                    <i class="pi pi-comments text-xl"></i>
                    <span class="font-semibold text-lg">Comentarios</span>
                    <p-tag [value]="comentarios().length + ''" severity="info" class="ml-auto" />
                </div>
            </ng-template>

            <div class="flex flex-col gap-4">
                @if (comentarios().length === 0) {
                    <div class="text-center text-surface-500 py-8">
                        <i class="pi pi-comments text-4xl mb-3 block"></i>
                        <p>No hay comentarios aún</p>
                    </div>
                }

                @for (comentario of comentarios(); track comentario.id) {
                    <div class="flex gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <p-avatar [label]="comentario.nombreTutor.charAt(0).toUpperCase()" shape="circle" size="normal" />
                        <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-semibold text-sm">{{ comentario.nombreTutor }}</span>
                                <span class="text-xs text-surface-400">{{ comentario.fechaCreacion | date:'dd/MM/yyyy HH:mm' }}</span>
                            </div>
                            <p class="m-0 text-sm whitespace-pre-wrap">{{ comentario.comentario }}</p>
                        </div>
                    </div>
                }
            </div>

            @if (!readOnly) {
                <ng-template pTemplate="footer">
                    <div class="flex flex-col gap-2">
                        <textarea pTextarea [(ngModel)]="nuevoComentario" rows="3" placeholder="Escribe un comentario..." class="w-full"></textarea>
                        <p-button label="Enviar comentario" icon="pi pi-send" (onClick)="enviarComentario()" [disabled]="!nuevoComentario.trim()" [loading]="enviando()" class="w-full" />
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
    nuevoComentario = '';

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
