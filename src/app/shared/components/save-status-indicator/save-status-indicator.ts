import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SaveState } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-save-status-indicator',
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './save-status-indicator.html',
  styleUrl: './save-status-indicator.css'
})
export class SaveStatusIndicatorComponent {
  saveState = input.required<SaveState>();
  onRetry = output<void>();

  formatTime(date: Date | null): string {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'ahora';
    if (minutes === 1) return 'hace 1 minuto';
    if (minutes < 60) return `hace ${minutes} minutos`;

    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
