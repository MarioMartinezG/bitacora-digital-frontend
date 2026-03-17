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
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { PanelModule } from 'primeng/panel';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DimensionDTO, CrearDimensionRequest, MetodologiaDTO, CrearMetodologiaRequest } from '../../../../../core/models';
import { DimensionService } from '../../../../../core/services/dimension.service';
import { MetodologiaService } from '../../../../../core/services/metodologia.service';

@Component({
  selector: 'app-aprendizaje-widget',
  templateUrl: './aprendizaje-widget.html',
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
    SelectModule,
    SkeletonModule,
    TooltipModule,
    PanelModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class AprendizajeWidget implements OnInit {

  // ── Dimensiones ──────────────────────────────────────────────────────────────
  dimensiones = signal<DimensionDTO[]>([]);
  cargandoDimensiones = signal(false);
  guardandoDimension = signal(false);
  dialogDimensionVisible = signal(false);
  editandoDimensionId: number | null = null;
  formDimension: { nombre: string } = { nombre: '' };

  filtroDimensionNombre = '';
  filtroDimensionVisibilidad = 'todos';

  // ── Metodologías ─────────────────────────────────────────────────────────────
  metodologias = signal<MetodologiaDTO[]>([]);
  cargandoMetodologias = signal(false);
  guardandoMetodologia = signal(false);
  dialogMetodologiaVisible = signal(false);
  editandoMetodologiaId: number | null = null;
  formMetodologia: { label: string } = { label: '' };

  filtroMetodologiaNombre = '';
  filtroMetodologiaVisibilidad = 'todos';

  // ── Opciones compartidas ─────────────────────────────────────────────────────
  visibilidadOpciones = [
    { label: 'Todos',         value: 'todos' },
    { label: 'Solo visibles', value: 'visibles' },
    { label: 'Solo ocultos',  value: 'ocultos' },
  ];

  constructor(
    private dimensionService: DimensionService,
    private metodologiaService: MetodologiaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarDimensiones();
    this.cargarMetodologias();
  }

  // ── Computed: Filtros ────────────────────────────────────────────────────────

  private normalizar(texto: string): string {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  get dimensionesFiltradas(): DimensionDTO[] {
    const q = this.normalizar(this.filtroDimensionNombre);
    return this.dimensiones().filter(d => {
      const matchNombre = !q || this.normalizar(d.nombre).includes(q);
      const matchVis = this.filtroDimensionVisibilidad === 'todos' ||
                       (this.filtroDimensionVisibilidad === 'visibles' && d.activo) ||
                       (this.filtroDimensionVisibilidad === 'ocultos' && !d.activo);
      return matchNombre && matchVis;
    });
  }

  get metodologiasFiltradas(): MetodologiaDTO[] {
    const q = this.normalizar(this.filtroMetodologiaNombre);
    return this.metodologias().filter(m => {
      const matchNombre = !q || this.normalizar(m.label).includes(q);
      const matchVis = this.filtroMetodologiaVisibilidad === 'todos' ||
                       (this.filtroMetodologiaVisibilidad === 'visibles' && m.activo) ||
                       (this.filtroMetodologiaVisibilidad === 'ocultos' && !m.activo);
      return matchNombre && matchVis;
    });
  }

  // ── Métodos: Dimensiones ─────────────────────────────────────────────────────

  cargarDimensiones(): void {
    this.cargandoDimensiones.set(true);
    this.dimensionService.obtenerTodas().subscribe({
      next: (data) => { this.dimensiones.set(data); this.cargandoDimensiones.set(false); },
      error: () => {
        this.cargandoDimensiones.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las dimensiones', life: 3000 });
      }
    });
  }

  abrirNuevaDimension(): void {
    this.editandoDimensionId = null;
    this.formDimension = { nombre: '' };
    this.dialogDimensionVisible.set(true);
  }

  abrirEditarDimension(dimension: DimensionDTO): void {
    this.editandoDimensionId = dimension.id;
    this.formDimension = { nombre: dimension.nombre };
    this.dialogDimensionVisible.set(true);
  }

  guardarDimension(): void {
    if (!this.formDimension.nombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El nombre de la dimensión es obligatorio', life: 3000 });
      return;
    }
    const request: CrearDimensionRequest = { nombre: this.formDimension.nombre.trim() };
    this.guardandoDimension.set(true);
    const op$ = this.editandoDimensionId !== null
      ? this.dimensionService.actualizarDimension(this.editandoDimensionId, request)
      : this.dimensionService.crearDimension(request);

    op$.subscribe({
      next: (resultado) => {
        if (this.editandoDimensionId !== null) {
          this.dimensiones.update(list => list.map(d => d.id === resultado.id ? resultado : d));
        } else {
          this.dimensiones.update(list => [...list, resultado]);
        }
        this.dimensionService.invalidarCache();
        this.guardandoDimension.set(false);
        this.dialogDimensionVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.editandoDimensionId ? 'Actualizado' : 'Creado',
          detail: `Dimensión ${this.editandoDimensionId ? 'actualizada' : 'creada'} correctamente`,
          life: 3000
        });
      },
      error: () => {
        this.guardandoDimension.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la dimensión', life: 3000 });
      }
    });
  }

  toggleActivoDimension(dimension: DimensionDTO): void {
    this.dimensionService.toggleActivo(dimension.id).subscribe({
      next: (resultado) => {
        this.dimensiones.update(list => list.map(d => d.id === resultado.id ? resultado : d));
        this.dimensionService.invalidarCache();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado de la dimensión', life: 3000 });
      }
    });
  }

  // ── Métodos: Metodologías ────────────────────────────────────────────────────

  cargarMetodologias(): void {
    this.cargandoMetodologias.set(true);
    this.metodologiaService.obtenerTodas().subscribe({
      next: (data) => { this.metodologias.set(data); this.cargandoMetodologias.set(false); },
      error: () => {
        this.cargandoMetodologias.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las metodologías', life: 3000 });
      }
    });
  }

  abrirNuevaMetodologia(): void {
    this.editandoMetodologiaId = null;
    this.formMetodologia = { label: '' };
    this.dialogMetodologiaVisible.set(true);
  }

  abrirEditarMetodologia(metodologia: MetodologiaDTO): void {
    this.editandoMetodologiaId = metodologia.id;
    this.formMetodologia = { label: metodologia.label };
    this.dialogMetodologiaVisible.set(true);
  }

  guardarMetodologia(): void {
    if (!this.formMetodologia.label.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El nombre de la metodología es obligatorio', life: 3000 });
      return;
    }
    const request: CrearMetodologiaRequest = { label: this.formMetodologia.label.trim() };
    this.guardandoMetodologia.set(true);
    const op$ = this.editandoMetodologiaId !== null
      ? this.metodologiaService.actualizarMetodologia(this.editandoMetodologiaId, request)
      : this.metodologiaService.crearMetodologia(request);

    op$.subscribe({
      next: (resultado) => {
        if (this.editandoMetodologiaId !== null) {
          this.metodologias.update(list => list.map(m => m.id === resultado.id ? resultado : m));
        } else {
          this.metodologias.update(list => [...list, resultado]);
        }
        this.metodologiaService.invalidarCache();
        this.guardandoMetodologia.set(false);
        this.dialogMetodologiaVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: this.editandoMetodologiaId ? 'Actualizado' : 'Creado',
          detail: `Metodología ${this.editandoMetodologiaId ? 'actualizada' : 'creada'} correctamente`,
          life: 3000
        });
      },
      error: () => {
        this.guardandoMetodologia.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la metodología', life: 3000 });
      }
    });
  }

  toggleActivoMetodologia(metodologia: MetodologiaDTO): void {
    this.metodologiaService.toggleActivo(metodologia.id).subscribe({
      next: (resultado) => {
        this.metodologias.update(list => list.map(m => m.id === resultado.id ? resultado : m));
        this.metodologiaService.invalidarCache();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado de la metodología', life: 3000 });
      }
    });
  }
}
