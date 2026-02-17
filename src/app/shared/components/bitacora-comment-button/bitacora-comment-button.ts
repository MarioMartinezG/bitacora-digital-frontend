import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { CommentThreadComponent } from '../comment-thread/comment-thread';
import { LoginService } from '../../../core/services/login.service';

@Component({
    selector: 'app-bitacora-comment-button',
    standalone: true,
    imports: [CommonModule, ButtonModule, BadgeModule, CommentThreadComponent],
    template: `
        <p-button
            icon="pi pi-comments"
            [rounded]="true"
            [text]="true"
            severity="secondary"
            size="small"
            [badge]="badge > 0 ? badge + '' : undefined"
            badgeSeverity="info"
            (onClick)="drawerVisible = true"
            pTooltip="Ver comentarios" />

        <app-comment-thread
            [estudianteId]="estudianteId"
            [seccionCodigo]="seccionCodigo"
            [subseccionCodigo]="subseccionCodigo"
            [readOnly]="true"
            [(visible)]="drawerVisible"
            (comentarioAgregado)="onComentarioAgregado()" />
    `
})
export class BitacoraCommentButtonComponent {
    private loginService = inject(LoginService);

    @Input() seccionCodigo!: string;
    @Input() subseccionCodigo!: string;
    @Input() badge = 0;

    drawerVisible = false;

    get estudianteId(): number {
        const user = JSON.parse(this.loginService.getUser() ?? '{}');
        return user.id;
    }

    onComentarioAgregado(): void {
        this.badge++;
    }
}
