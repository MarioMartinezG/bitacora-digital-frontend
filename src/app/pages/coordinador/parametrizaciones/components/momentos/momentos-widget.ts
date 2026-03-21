import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { MomentoDTO, CrearMomentoRequest } from '../../../../../core/models';
import { MomentoService } from '../../../../../core/services/momento.service';

const SECCIONES: { label: string; value: string }[] = [
  { label: 'Observar, registrar y actuar de manera oportuna', value: 'observar' },
  { label: 'Identificación de tu curso', value: 'caracteriza' },
  { label: 'Factores Situacionales', value: 'factores' },
  { label: 'Actividades de Aprendizaje', value: 'actividades' },
  { label: 'Diseño de la evaluación', value: 'evaluacion' },
  { label: 'Secuencia y cronograma', value: 'secuencia' },
  { label: 'Calificación', value: 'calificacion' },
  { label: 'Medios educativos', value: 'bibliografia' }
];

@Component({
  selector: 'app-momentos-widget',
  templateUrl: './momentos-widget.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    MultiSelectModule,
    SkeletonModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class MomentosWidget implements OnInit {

  momentos = signal<MomentoDTO[]>([]);
  cargando = signal(false);
  guardando = signal(false);
  dialogVisible = signal(false);
  editandoId: number | null = null;
  seccionesOptions = SECCIONES;

  form: { nombre: string; descripcion: string; fechaLimite: Date | null; secciones: string[] } = {
    nombre: '', descripcion: '', fechaLimite: null, secciones: []
  };

  constructor(
    private momentoService: MomentoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarMomentos();
  }

  cargarMomentos(): void {
    this.cargando.set(true);
    this.momentoService.obtenerMomentos().subscribe({
      next: (data) => { this.momentos.set(data); this.cargando.set(false); },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los momentos', life: 3000 });
      }
    });
  }

  abrirNuevo(): void {
    this.editandoId = null;
    this.form = { nombre: '', descripcion: '', fechaLimite: null, secciones: [] };
    this.dialogVisible.set(true);
  }

  abrirEditar(momento: MomentoDTO): void {
    this.editandoId = momento.id;
    const [year, month, day] = momento.fechaLimite.split('-').map(Number);
    this.form = {
      nombre: momento.nombre,
      descripcion: momento.descripcion ?? '',
      fechaLimite: new Date(year, month - 1, day),
      secciones: [...momento.secciones]
    };
    this.dialogVisible.set(true);
  }

  guardarMomento(): void {
    if (!this.form.nombre.trim() || !this.form.fechaLimite) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'El nombre y la fecha límite son obligatorios', life: 3000 });
      return;
    }
    const d = this.form.fechaLimite!;
    const fechaStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const request: CrearMomentoRequest = {
      nombre: this.form.nombre.trim(),
      descripcion: this.form.descripcion.trim() || undefined,
      fechaLimite: fechaStr,
      secciones: this.form.secciones
    };
    this.guardando.set(true);
    const op$ = this.editandoId !== null
      ? this.momentoService.actualizarMomento(this.editandoId, request)
      : this.momentoService.crearMomento(request);

    op$.subscribe({
      next: (resultado) => {
        if (this.editandoId !== null) {
          this.momentos.update(list => list.map(m => m.id === resultado.id ? resultado : m));
        } else {
          this.momentos.update(list => [...list, resultado]);
        }
        this.guardando.set(false);
        this.dialogVisible.set(false);
        this.messageService.add({ severity: 'success', summary: this.editandoId ? 'Actualizado' : 'Creado', detail: `Momento ${this.editandoId ? 'actualizado' : 'creado'} correctamente`, life: 3000 });
      },
      error: (err) => {
        this.guardando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message ?? 'No se pudo guardar el momento', life: 3000 });
      }
    });
  }

  confirmarEliminar(momento: MomentoDTO): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el momento <strong>${momento.nombre}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.eliminarMomento(momento)
    });
  }

  private eliminarMomento(momento: MomentoDTO): void {
    this.momentoService.eliminarMomento(momento.id).subscribe({
      next: () => {
        this.momentos.update(list => list.filter(m => m.id !== momento.id));
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Momento eliminado correctamente', life: 3000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el momento', life: 3000 });
      }
    });
  }

  getSeccionLabel(codigo: string): string {
    return SECCIONES.find(s => s.value === codigo)?.label ?? codigo;
  }

  formatFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day))
      .toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
