import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(
    private messageService: MessageService,
  ) { }

  /**
     * Displays a success message.
     * @param summary The summary of the message.
     * @param detail The detailed content of the message.
     */
  showSuccess(summary: string, detail: string): void {
    this.messageService.add({ severity: 'success', summary: summary, detail: detail });
  }

  /**
   * Displays an information message.
   * @param summary The summary of the message.
   * @param detail The detailed content of the message.
   */
  showInfo(summary: string, detail: string): void {
    this.messageService.add({ severity: 'info', summary: summary, detail: detail });
  }

  /**
   * Displays a warning message.
   * @param summary The summary of the message.
   * @param detail The detailed content of the message.
   */
  showWarn(summary: string, detail: string): void {
    this.messageService.add({ severity: 'warn', summary: summary, detail: detail });
  }

  /**
   * Displays an error message.
   * @param summary The summary of the message.
   * @param detail The detailed content of the message.
   */
  showError(summary: string, detail: string): void {
    this.messageService.add({ severity: 'error', summary: summary, detail: detail });
  }

  /**
   * Clears all messages.
   */
  clear(): void {
    this.messageService.clear();
  }
}