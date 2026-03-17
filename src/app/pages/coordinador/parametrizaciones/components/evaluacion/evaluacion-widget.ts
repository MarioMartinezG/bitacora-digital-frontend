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
import {
  MedioDTO, CrearMedioRequest, CATEGORIA_MEDIO_CONFIG,
  TecnicaDTO, CrearTecnicaRequest, GRUPO_TECNICA_CONFIG,
  InstrumentoDTO, CrearInstrumentoRequest
} from '../../../../../core/models';
import { MedioService } from '../../../../../core/services/medio.service';
import { TecnicaService } from '../../../../../core/services/tecnica.service';
import { InstrumentoService } from '../../../../../core/services/instrumento.service';

@Component({
  selector: 'app-evaluacion-widget',
  templateUrl: './evaluacion-widget.html',
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
export class EvaluacionWidget implements OnInit {

  // ── Medios ───────────────────────────────────────────────────────────────────
  medios = signal<MedioDTO[]>([]);
  cargandoMedios = signal(false);
  guardandoMedio = signal(false);
  dialogMedioVisible = signal(false);
  editandoMedioId: number | null = null;

  formMedio: { label: string; categoria: string } = { label: '', categoria: '' };

  categoriasOpciones = [
    { label: 'Escritos',  value: 'ESCRITOS' },
    { label: 'Orales',    value: 'ORALES' },
    { label: 'Prácticos', value: 'PRACTICOS' },
  ];

  // ── Técnicas ─────────────────────────────────────────────────────────────────
  tecnicas = signal<TecnicaDTO[]>([]);
  cargandoTecnicas = signal(false);
  guardandoTecnica = signal(false);
  dialogTecnicaVisible = signal(false);
  editandoTecnicaId: number | null = null;
  formTecnica: { label: string; grupo: string } = { label: '', grupo: '' };

  gruposOpciones = [
    { label: 'El alumno no interviene', value: 'ALUMNO_NO_INTERVIENE' },
    { label: 'El alumno participa',     value: 'ALUMNO_PARTICIPA' },
  ];

  // ── Instrumentos ─────────────────────────────────────────────────────────────
  instrumentos = signal<InstrumentoDTO[]>([]);
  cargandoInstrumentos = signal(false);
  guardandoInstrumento = signal(false);
  dialogInstrumentoVisible = signal(false);
  editandoInstrumentoId: number | null = null;
  formInstrumento: { label: string } = { label: '' };

  // ── Filtros: Medios ──────────────────────────────────────────────────────────
  filtroMedioNombre = '';
  filtroMedioCategoria = '';
  filtroMedioVisibilidad = 'todos';

  // ── Filtros: Técnicas ────────────────────────────────────────────────────────
  filtroTecnicaNombre = '';
  filtroTecnicaGrupo = '';
  filtroTecnicaVisibilidad = 'todos';

  // ── Filtros: Instrumentos ────────────────────────────────────────────────────
  filtroInstrumentoNombre = '';
  filtroInstrumentoVisibilidad = 'todos';

  // ── Opciones compartidas ─────────────────────────────────────────────────────
  visibilidadOpciones = [
    { label: 'Todos',          value: 'todos' },
    { label: 'Solo visibles',  value: 'visibles' },
    { label: 'Solo ocultos',   value: 'ocultos' },
  ];

  constructor(
    private medioService: MedioService,
    private tecnicaService: TecnicaService,
    private instrumentoService: InstrumentoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarMedios();
    this.cargarTecnicas();
    this.cargarInstrumentos();
  }

  // ── Computed: Filtros ────────────────────────────────────────────────────────

  private normalizar(texto: string): string {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  get mediosFiltrados(): MedioDTO[] {
    const q = this.normalizar(this.filtroMedioNombre);
    return this.medios().filter(m => {
      const matchNombre = !q || this.normalizar(m.label).includes(q);
      const matchCat = !this.filtroMedioCategoria || m.categoria === this.filtroMedioCategoria;
      const matchVis = this.filtroMedioVisibilidad === 'todos' ||
                       (this.filtroMedioVisibilidad === 'visibles' && m.activo) ||
                       (this.filtroMedioVisibilidad === 'ocultos' && !m.activo);
      return matchNombre && matchCat && matchVis;
    });
  }

  get tecnicasFiltradas(): TecnicaDTO[] {
    const q = this.normalizar(this.filtroTecnicaNombre);
    return this.tecnicas().filter(t => {
      const matchNombre = !q || this.normalizar(t.label).includes(q);
      const matchGrupo = !this.filtroTecnicaGrupo || t.grupo === this.filtroTecnicaGrupo;
      const matchVis = this.filtroTecnicaVisibilidad === 'todos' ||
                       (this.filtroTecnicaVisibilidad === 'visibles' && t.activo) ||
                       (this.filtroTecnicaVisibilidad === 'ocultos' && !t.activo);
      return matchNombre && matchGrupo && matchVis;
    });
  }

  get instrumentosFiltrados(): InstrumentoDTO[] {
    const q = this.normalizar(this.filtroInstrumentoNombre);
    return this.instrumentos().filter(i => {
      const matchNombre = !q || this.normalizar(i.label).includes(q);
      const matchVis = this.filtroInstrumentoVisibilidad === 'todos' ||
                       (this.filtroInstrumentoVisibilidad === 'visibles' && i.activo) ||
                       (this.filtroInstrumentoVisibilidad === 'ocultos' && !i.activo);
      return matchNombre && matchVis;
    });
  }

  // ── Métodos: Medios ──────────────────────────────────────────────────────────

  cargarMedios(): void {
    this.cargandoMedios.set(true);
    this.medioService.obtenerTodos().subscribe({
      next: (data) => { this.medios.set(data); this.cargandoMedios.set(false); },
      error: () => {
        this.cargandoMedios.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los medios', life: 3000 });
      }
    });
  }

  abrirNuevoMedio(): void {
    this.editandoMedioId = null;
    this.formMedio = { label: '', categoria: '' };
    this.dialogMedioVisible.set(true);
  }

  abrirEditarMedio(medio: MedioDTO): void {
    this.editandoMedioId = medio.id;
    this.formMedio = { label: medio.label, categoria: medio.categoria };
    this.dialogMedioVisible.set(true);
  }

  guardarMedio(): void {
    if (!this.formMedio.label.trim() || !this.formMedio.categoria) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'El nombre y la categoría son obligatorios', life: 3000 });
      return;
    }
    const request: CrearMedioRequest = { label: this.formMedio.label.trim(), categoria: this.formMedio.categoria };
    this.guardandoMedio.set(true);
    const op$ = this.editandoMedioId !== null
      ? this.medioService.actualizarMedio(this.editandoMedioId, request)
      : this.medioService.crearMedio(request);

    op$.subscribe({
      next: (resultado) => {
        if (this.editandoMedioId !== null) {
          this.medios.update(list => list.map(m => m.id === resultado.id ? resultado : m));
        } else {
          this.medios.update(list => [...list, resultado]);
        }
        this.medioService.invalidarCache();
        this.guardandoMedio.set(false);
        this.dialogMedioVisible.set(false);
        this.messageService.add({ severity: 'success', summary: this.editandoMedioId ? 'Actualizado' : 'Creado', detail: `Medio ${this.editandoMedioId ? 'actualizado' : 'creado'} correctamente`, life: 3000 });
      },
      error: () => {
        this.guardandoMedio.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el medio', life: 3000 });
      }
    });
  }

  toggleActivoMedio(medio: MedioDTO): void {
    this.medioService.toggleActivo(medio.id).subscribe({
      next: (resultado) => {
        this.medios.update(list => list.map(m => m.id === resultado.id ? resultado : m));
        this.medioService.invalidarCache();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado del medio', life: 3000 });
      }
    });
  }

  getCategoriaLabel(cat: string): string {
    return CATEGORIA_MEDIO_CONFIG[cat as keyof typeof CATEGORIA_MEDIO_CONFIG]?.label ?? cat;
  }

  getCategoriaColor(cat: string): 'success' | 'warn' | 'secondary' {
    if (cat === 'ESCRITOS')  return 'success';
    if (cat === 'ORALES')    return 'warn';
    return 'secondary';
  }

  // ── Métodos: Técnicas ────────────────────────────────────────────────────────

  cargarTecnicas(): void {
    this.cargandoTecnicas.set(true);
    this.tecnicaService.obtenerTodas().subscribe({
      next: (data) => { this.tecnicas.set(data); this.cargandoTecnicas.set(false); },
      error: () => {
        this.cargandoTecnicas.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las técnicas', life: 3000 });
      }
    });
  }

  abrirNuevaTecnica(): void {
    this.editandoTecnicaId = null;
    this.formTecnica = { label: '', grupo: '' };
    this.dialogTecnicaVisible.set(true);
  }

  abrirEditarTecnica(tecnica: TecnicaDTO): void {
    this.editandoTecnicaId = tecnica.id;
    this.formTecnica = { label: tecnica.label, grupo: tecnica.grupo };
    this.dialogTecnicaVisible.set(true);
  }

  guardarTecnica(): void {
    if (!this.formTecnica.label.trim() || !this.formTecnica.grupo) {
      this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'El nombre y el grupo son obligatorios', life: 3000 });
      return;
    }
    const request: CrearTecnicaRequest = { label: this.formTecnica.label.trim(), grupo: this.formTecnica.grupo };
    this.guardandoTecnica.set(true);
    const op$ = this.editandoTecnicaId !== null
      ? this.tecnicaService.actualizarTecnica(this.editandoTecnicaId, request)
      : this.tecnicaService.crearTecnica(request);

    op$.subscribe({
      next: (resultado) => {
        if (this.editandoTecnicaId !== null) {
          this.tecnicas.update(list => list.map(t => t.id === resultado.id ? resultado : t));
        } else {
          this.tecnicas.update(list => [...list, resultado]);
        }
        this.tecnicaService.invalidarCache();
        this.guardandoTecnica.set(false);
        this.dialogTecnicaVisible.set(false);
        this.messageService.add({ severity: 'success', summary: this.editandoTecnicaId ? 'Actualizado' : 'Creado', detail: `Técnica ${this.editandoTecnicaId ? 'actualizada' : 'creada'} correctamente`, life: 3000 });
      },
      error: () => {
        this.guardandoTecnica.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la técnica', life: 3000 });
      }
    });
  }

  toggleActivoTecnica(tecnica: TecnicaDTO): void {
    this.tecnicaService.toggleActivo(tecnica.id).subscribe({
      next: (resultado) => {
        this.tecnicas.update(list => list.map(t => t.id === resultado.id ? resultado : t));
        this.tecnicaService.invalidarCache();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado de la técnica', life: 3000 });
      }
    });
  }

  getGrupoLabel(grupo: string): string {
    return GRUPO_TECNICA_CONFIG[grupo as keyof typeof GRUPO_TECNICA_CONFIG]?.label ?? grupo;
  }

  getGrupoColor(grupo: string): 'info' | 'secondary' {
    return grupo === 'ALUMNO_NO_INTERVIENE' ? 'info' : 'secondary';
  }

  // ── Métodos: Instrumentos ────────────────────────────────────────────────────

  cargarInstrumentos(): void {
    this.cargandoInstrumentos.set(true);
    this.instrumentoService.obtenerTodos().subscribe({
      next: (data) => { this.instrumentos.set(data); this.cargandoInstrumentos.set(false); },
      error: () => {
        this.cargandoInstrumentos.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los instrumentos', life: 3000 });
      }
    });
  }

  abrirNuevoInstrumento(): void {
    this.editandoInstrumentoId = null;
    this.formInstrumento = { label: '' };
    this.dialogInstrumentoVisible.set(true);
  }

  abrirEditarInstrumento(instrumento: InstrumentoDTO): void {
    this.editandoInstrumentoId = instrumento.id;
    this.formInstrumento = { label: instrumento.label };
    this.dialogInstrumentoVisible.set(true);
  }

  guardarInstrumento(): void {
    if (!this.formInstrumento.label.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Campo requerido', detail: 'El nombre del instrumento es obligatorio', life: 3000 });
      return;
    }
    const request: CrearInstrumentoRequest = { label: this.formInstrumento.label.trim() };
    this.guardandoInstrumento.set(true);
    const op$ = this.editandoInstrumentoId !== null
      ? this.instrumentoService.actualizarInstrumento(this.editandoInstrumentoId, request)
      : this.instrumentoService.crearInstrumento(request);

    op$.subscribe({
      next: (resultado) => {
        if (this.editandoInstrumentoId !== null) {
          this.instrumentos.update(list => list.map(i => i.id === resultado.id ? resultado : i));
        } else {
          this.instrumentos.update(list => [...list, resultado]);
        }
        this.instrumentoService.invalidarCache();
        this.guardandoInstrumento.set(false);
        this.dialogInstrumentoVisible.set(false);
        this.messageService.add({ severity: 'success', summary: this.editandoInstrumentoId ? 'Actualizado' : 'Creado', detail: `Instrumento ${this.editandoInstrumentoId ? 'actualizado' : 'creado'} correctamente`, life: 3000 });
      },
      error: () => {
        this.guardandoInstrumento.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el instrumento', life: 3000 });
      }
    });
  }

  toggleActivoInstrumento(instrumento: InstrumentoDTO): void {
    this.instrumentoService.toggleActivo(instrumento.id).subscribe({
      next: (resultado) => {
        this.instrumentos.update(list => list.map(i => i.id === resultado.id ? resultado : i));
        this.instrumentoService.invalidarCache();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado del instrumento', life: 3000 });
      }
    });
  }
}
