import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProgramaDTO, CrearProgramaRequest } from '../../../../../core/models';
import { ProgramaService } from '../../../../../core/services/programa.service';

@Component({
  selector: 'app-programas-widget',
  templateUrl: './programas-widget.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    InputTextModule,
    SkeletonModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class ProgramasWidget implements OnInit {

  programas = signal<ProgramaDTO[]>([]);
  cargandoProgramas = signal(false);
  guardandoPrograma = signal(false);
  dialogProgramaVisible = signal(false);
  editandoProgramaId: number | null = null;
  nombrePrograma: string = '';

  constructor(
    private programaService: ProgramaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarProgramas();
  }

  cargarProgramas(): void {
    this.cargandoProgramas.set(true);
    this.programaService.obtenerProgramas().subscribe({
      next: (data) => { this.programas.set(data); this.cargandoProgramas.set(false); },
      error: () => {
        this.cargandoProgramas.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los programas', life: 3000 });
      }
    });
  }

  abrirNuevoPrograma(): void {
    this.editandoProgramaId = null;
    this.nombrePrograma = '';
    this.dialogProgramaVisible.set(true);
  }

  abrirEditarPrograma(programa: ProgramaDTO): void {
    this.editandoProgramaId = programa.id;
    this.nombrePrograma = programa.nombre;
    this.dialogProgramaVisible.set(true);
  }

  guardarPrograma(): void {
    if (!this.nombrePrograma.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El nombre del programa es obligatorio', life: 3000 });
      return;
    }
    const request: CrearProgramaRequest = { nombre: this.nombrePrograma.trim() };
    this.guardandoPrograma.set(true);
    const op$ = this.editandoProgramaId !== null
      ? this.programaService.actualizarPrograma(this.editandoProgramaId, request)
      : this.programaService.crearPrograma(request);

    op$.subscribe({
      next: (resultado) => {
        if (this.editandoProgramaId !== null) {
          this.programas.update(list => list.map(p => p.id === resultado.id ? resultado : p));
        } else {
          this.programas.update(list => [...list, resultado]);
        }
        this.guardandoPrograma.set(false);
        this.dialogProgramaVisible.set(false);
        this.messageService.add({ severity: 'success', summary: this.editandoProgramaId ? 'Actualizado' : 'Creado', detail: `Programa ${this.editandoProgramaId ? 'actualizado' : 'creado'} correctamente`, life: 3000 });
      },
      error: () => {
        this.guardandoPrograma.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el programa', life: 3000 });
      }
    });
  }

  confirmarEliminarPrograma(programa: ProgramaDTO): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el programa <strong>${programa.nombre}</strong>? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.programaService.eliminarPrograma(programa.id).subscribe({
          next: () => {
            this.programas.update(list => list.filter(p => p.id !== programa.id));
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Programa eliminado correctamente', life: 3000 });
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el programa', life: 3000 });
          }
        });
      }
    });
  }
}
