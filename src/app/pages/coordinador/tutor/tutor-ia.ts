import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { KeyValuePipe } from '@angular/common';

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

// Models
import {
  TutorHealth,
  TutorStatus,
  DocumentInfo,
  DocumentUploadResponse,
  IndexTaskResponse,
  IndexStatusResponse
} from '../../../core/models';

// Services
import { TutorService } from '../../../core/services/tutor.service';

@Component({
  selector: 'app-tutor-ia',
  standalone: true,
  imports: [
    KeyValuePipe,
    TabsModule,
    ButtonModule,
    TagModule,
    TableModule,
    ToastModule,
    SkeletonModule,
    TooltipModule
  ],
  templateUrl: './tutor-ia.html',
  providers: [MessageService]
})
export class TutorIa implements OnInit, OnDestroy {
  private tutorService = inject(TutorService);
  private messageService = inject(MessageService);

  private pollTimer: any = null;

  // ── Estado del sistema ────────────────────────────────────────────
  health = signal<TutorHealth | null>(null);
  status = signal<TutorStatus | null>(null);
  cargandoSistema = signal(true);
  logs = signal<{ nivel: 'ok' | 'error' | 'warn'; mensaje: string; detalle?: string }[]>([]);

  // ── Documentos ────────────────────────────────────────────────────
  documentos = signal<DocumentInfo[]>([]);
  cargandoDocumentos = signal(false);
  subiendoArchivos = signal(false);
  resultadoSubida = signal<DocumentUploadResponse | null>(null);

  // ── Indexación ────────────────────────────────────────────────────
  iniciandoIndexacion = signal(false);
  estadoIndexacion = signal<IndexStatusResponse | null>(null);
  tareaActualId = signal<string | null>(null);
  indexacionMensaje = signal('');

  ngOnInit(): void {
    this.verificarSalud();
    this.cargarDocumentos();
  }

  ngOnDestroy(): void {
    this.detenerPoll();
  }

  // ── Sistema ───────────────────────────────────────────────────────
  verificarSalud(): void {
    this.cargandoSistema.set(true);
    this.logs.set([]);

    this.tutorService.getHealth().subscribe({
      next: (h) => {
        this.health.set(h);
        const entradas: { nivel: 'ok' | 'error' | 'warn'; mensaje: string; detalle?: string }[] = [];

        if (h.status === 'healthy') {
          entradas.push({ nivel: 'ok', mensaje: 'Servicio TEIA operativo', detalle: `Estado reportado: ${h.status}` });
        } else {
          entradas.push({ nivel: 'error', mensaje: 'El servicio TEIA reporta un estado anormal', detalle: `Estado: ${h.status}${h.message ? ' — ' + h.message : ''}` });
        }

        if (h.ollama_connected) {
          entradas.push({ nivel: 'ok', mensaje: 'Motor de inteligencia artificial disponible', detalle: 'Conexión con Ollama establecida correctamente' });
        } else {
          entradas.push({ nivel: 'error', mensaje: 'Motor de IA no disponible — las consultas no funcionarán', detalle: 'No se pudo establecer conexión con Ollama. Verifica que el servicio esté corriendo.' });
        }

        this.tutorService.getStatus().subscribe({
          next: (s) => {
            this.status.set(s);
            const modelo = s.model_used ?? s.models?.[0];
            if (modelo) {
              entradas.push({ nivel: 'ok', mensaje: `Modelo de lenguaje cargado: ${modelo}`, detalle: `Modelos disponibles: ${s.models?.join(', ') || modelo}` });
            } else {
              entradas.push({ nivel: 'warn', mensaje: 'No se detectó un modelo de lenguaje activo', detalle: 'El servicio está operativo pero sin modelo cargado. Las consultas pueden fallar.' });
            }
            this.logs.set(entradas);
            this.cargandoSistema.set(false);
          },
          error: (err) => {
            entradas.push({ nivel: 'error', mensaje: 'No se pudo obtener la configuración del servicio', detalle: `Error al consultar /api/tutor/status: ${err?.message ?? 'sin detalle'}` });
            this.logs.set(entradas);
            this.cargandoSistema.set(false);
          }
        });
      },
      error: (err) => {
        this.health.set(null);
        this.logs.set([
          { nivel: 'error', mensaje: 'No se pudo conectar con el servicio TEIA', detalle: `Error al consultar /api/tutor/health: ${err?.message ?? 'sin detalle'}. Verifica que el backend esté corriendo.` }
        ]);
        this.cargandoSistema.set(false);
      }
    });
  }

  get apiConectada(): boolean { return this.health() !== null; }
  get ollamaConectado(): boolean { return this.health()?.ollama_connected ?? false; }
  get modeloActivo(): string { return this.status()?.model_used ?? (this.status()?.models?.[0] ?? '-'); }

  // ── Documentos ────────────────────────────────────────────────────
  cargarDocumentos(): void {
    this.cargandoDocumentos.set(true);
    this.tutorService.getDocuments().subscribe({
      next: (r) => { this.documentos.set(r.documents ?? []); this.cargandoDocumentos.set(false); },
      error: () => this.cargandoDocumentos.set(false)
    });
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    input.value = '';
    this.subirArchivos(files);
  }

  private subirArchivos(files: File[]): void {
    this.subiendoArchivos.set(true);
    this.resultadoSubida.set(null);

    this.tutorService.uploadDocuments(files).subscribe({
      next: (r) => {
        this.resultadoSubida.set(r);
        this.subiendoArchivos.set(false);
        this.cargarDocumentos();
        if (r.uploaded_files?.length) {
          this.messageService.add({ severity: 'success', summary: 'Archivos subidos', detail: `${r.uploaded_files?.length} archivo(s) subido(s) correctamente` });
        }
        if (r.failed_files?.length) {
          this.messageService.add({ severity: 'warn', summary: 'Algunos errores', detail: `${r.failed_files?.length} archivo(s) fallaron` });
        }
      },
      error: () => {
        this.subiendoArchivos.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron subir los archivos' });
      }
    });
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // ── Indexación ────────────────────────────────────────────────────
  iniciarIndexacion(): void {
    this.iniciandoIndexacion.set(true);
    this.estadoIndexacion.set(null);
    this.indexacionMensaje.set('Iniciando indexación...');

    this.tutorService.startIndexing().subscribe({
      next: (r: IndexTaskResponse) => {
        this.tareaActualId.set(r.task_id);
        this.indexacionMensaje.set(r.message);
        this.iniciandoIndexacion.set(false);
        this.iniciarPoll(r.task_id);
        this.messageService.add({ severity: 'info', summary: 'Indexación iniciada', detail: `Tarea: ${r.task_id}` });
      },
      error: () => {
        this.iniciandoIndexacion.set(false);
        this.indexacionMensaje.set('');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo iniciar la indexación' });
      }
    });
  }

  private iniciarPoll(taskId: string): void {
    this.detenerPoll();
    this.pollTimer = setInterval(() => {
      this.tutorService.getIndexStatus(taskId).subscribe({
        next: (s) => {
          this.estadoIndexacion.set(s);
          this.indexacionMensaje.set(s.message);
          if (s.status !== 'running' && s.status !== 'pending') {
            this.detenerPoll();
            const ok = s.status === 'completed';
            this.messageService.add({
              severity: ok ? 'success' : 'error',
              summary: ok ? 'Indexación completada' : 'Indexación fallida',
              detail: s.message
            });
          }
        },
        error: () => this.detenerPoll()
      });
    }, 2000);
  }

  private detenerPoll(): void {
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
  }

  indexacionEnProgreso(): boolean {
    const s = this.estadoIndexacion()?.status;
    return s === 'running' || s === 'pending';
  }

  statusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    const map: Record<string, any> = {
      completed: 'success',
      running: 'info',
      pending: 'warn',
      failed: 'danger',
      error: 'danger'
    };
    return map[status] ?? 'secondary';
  }
}
