import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { PickListModule } from 'primeng/picklist';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TutorEstudianteDTO, TutorConEstudiantes } from '../../../core/models';
import { TutorEstudianteService } from '../../../core/services/tutor-estudiante.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { UserRole } from '../../../core/models/role.model';
import { forkJoin } from 'rxjs';

interface EstudianteItem {
  estudianteId: number;
  nombre: string;
  correo: string;
  asignacionId?: number;
}

interface TutorOption {
  label: string;
  value: number;
  correo: string;
}

@Component({
  selector: 'app-asignaciones-list',
  templateUrl: './asignaciones-list.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    SelectModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    TableModule,
    PickListModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class AsignacionesList implements OnInit {
  asignaciones = signal<TutorEstudianteDTO[]>([]);
  cargando = signal(false);
  procesando = signal(false);

  tutoresOptions = signal<TutorOption[]>([]);
  estudiantesSinTutor = signal<EstudianteItem[]>([]);

  // Dialog PickList (gestionar tutor)
  dialogPicklistVisible = signal(false);
  tutorPicklistId: number | null = null;
  picklistSource: EstudianteItem[] = [];
  picklistTarget: EstudianteItem[] = [];
  picklistOriginalTarget: EstudianteItem[] = [];
  guardando = signal(false);

  expandedRowKeys: Record<string, boolean> = {};
  busquedaTutores = signal('');
  busquedaEstudiantes = signal('');

  resumenTutoresFiltrados = computed(() => {
    const q = this.normalizar(this.busquedaTutores());
    return q ? this.resumenTutores().filter(t => this.normalizar(t.nombre).includes(q)) : this.resumenTutores();
  });

  estudiantesSinTutorFiltrados = computed(() => {
    const q = this.normalizar(this.busquedaEstudiantes());
    return q ? this.estudiantesSinTutor().filter(e => this.normalizar(e.nombre).includes(q)) : this.estudiantesSinTutor();
  });

  toggleRow(tutorId: number): void {
    const key = String(tutorId);
    if (this.expandedRowKeys[key]) {
      const updated = { ...this.expandedRowKeys };
      delete updated[key];
      this.expandedRowKeys = updated;
    } else {
      this.expandedRowKeys = { ...this.expandedRowKeys, [key]: true };
    }
  }

  // Dialog asignación rápida (desde estudiante sin tutor)
  dialogAsignarVisible = signal(false);
  estudianteParaAsignar: EstudianteItem | null = null;
  tutorRapidoId: number | null = null;
  asignandoRapido = signal(false);

  tutoresConEstudiantes = computed<TutorConEstudiantes[]>(() => {
    const mapa = new Map<number, TutorConEstudiantes>();
    for (const a of this.asignaciones()) {
      if (!mapa.has(a.tutorId)) {
        mapa.set(a.tutorId, {
          tutorId: a.tutorId,
          nombreTutor: a.nombreTutor,
          correoTutor: a.correoTutor,
          estudiantes: []
        });
      }
      mapa.get(a.tutorId)!.estudiantes.push(a);
    }
    return Array.from(mapa.values()).sort((a, b) => a.nombreTutor.localeCompare(b.nombreTutor));
  });

  resumenTutores = computed(() => {
    const countMap = new Map<number, number>();
    for (const a of this.asignaciones()) {
      countMap.set(a.tutorId, (countMap.get(a.tutorId) || 0) + 1);
    }
    return this.tutoresOptions().map(t => ({
      nombre: t.label,
      correo: t.correo,
      tutorId: t.value,
      total: countMap.get(t.value) || 0,
      estudiantes: this.asignaciones().filter(a => a.tutorId === t.value)
    })).sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));
  });

  promedioCarga = computed(() =>
    this.tutoresOptions().length > 0
      ? Math.round(this.asignaciones().length / this.tutoresOptions().length)
      : 0
  );

  totalAsignados = computed(() => this.asignaciones().length);
  totalTutores = computed(() => this.tutoresOptions().length);

  constructor(
    private tutorEstudianteService: TutorEstudianteService,
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando.set(true);
    forkJoin({
      asignaciones: this.tutorEstudianteService.obtenerTodasAsignaciones(),
      usuarios: this.usuariosService.listarUsuarios()
    }).subscribe({
      next: ({ asignaciones, usuarios }) => {
        this.asignaciones.set(asignaciones);

        const tutores = usuarios.filter(u =>
          (u.roles.includes(UserRole.TUTOR) || u.roles.includes(UserRole.COORDINADOR)) && u.activo
        );
        this.tutoresOptions.set(tutores.map(t => ({ label: t.nombre, value: t.id, correo: t.correo })));

        const asignadosIds = new Set(asignaciones.map(a => a.estudianteId));
        const sinTutor = usuarios.filter(u =>
          u.roles.includes(UserRole.ESTUDIANTE) && u.activo && !u.graduado && !asignadosIds.has(u.id)
        );
        this.estudiantesSinTutor.set(sinTutor.map(e => ({ estudianteId: e.id, nombre: e.nombre, correo: e.correo })));

        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las asignaciones', life: 3000 });
      }
    });
  }

  confirmarAsignacionAleatoria(): void {
    this.confirmationService.confirm({
      message: 'Se redistribuirán <strong>todos los estudiantes activos</strong> entre los tutores de forma equitativa. Las asignaciones actuales serán reemplazadas. ¿Deseas continuar?',
      header: 'Confirmar asignación aleatoria',
      icon: 'pi pi-shuffle',
      acceptLabel: 'Sí, redistribuir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => this.ejecutarAsignacionAleatoria()
    });
  }

  private ejecutarAsignacionAleatoria(): void {
    this.procesando.set(true);
    this.tutorEstudianteService.asignarAleatorio().subscribe({
      next: (resultado) => {
        this.procesando.set(false);
        this.asignaciones.set(resultado);
        this.estudiantesSinTutor.set([]);
        this.messageService.add({
          severity: 'success',
          summary: 'Asignación completada',
          detail: `${resultado.length} estudiantes distribuidos entre ${this.tutoresOptions().length} tutores`,
          life: 4000
        });
      },
      error: (err) => {
        this.procesando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message ?? 'No se pudo completar la asignación aleatoria', life: 4000 });
      }
    });
  }

  // PickList: gestionar estudiantes de un tutor específico
  abrirGestionTutor(tutorId: number): void {
    this.tutorPicklistId = tutorId;
    const asignacionesTutor = this.asignaciones().filter(a => a.tutorId === tutorId);
    const target: EstudianteItem[] = asignacionesTutor.map(a => ({
      estudianteId: a.estudianteId,
      nombre: a.nombreEstudiante,
      correo: a.correoEstudiante,
      asignacionId: a.id
    }));
    const targetIds = new Set(target.map(e => e.estudianteId));
    this.picklistSource = this.estudiantesSinTutor().filter(e => !targetIds.has(e.estudianteId));
    this.picklistTarget = [...target];
    this.picklistOriginalTarget = [...target];
    this.dialogPicklistVisible.set(true);
  }

  onTutorPicklistChange(): void {
    const tutorId = this.tutorPicklistId;
    if (!tutorId) {
      this.picklistSource = [...this.estudiantesSinTutor()];
      this.picklistTarget = [];
      this.picklistOriginalTarget = [];
      return;
    }
    const asignacionesTutor = this.asignaciones().filter(a => a.tutorId === tutorId);
    const target: EstudianteItem[] = asignacionesTutor.map(a => ({
      estudianteId: a.estudianteId,
      nombre: a.nombreEstudiante,
      correo: a.correoEstudiante,
      asignacionId: a.id
    }));
    const targetIds = new Set(target.map(e => e.estudianteId));
    this.picklistSource = this.estudiantesSinTutor().filter(e => !targetIds.has(e.estudianteId));
    this.picklistTarget = [...target];
    this.picklistOriginalTarget = [...target];
  }

  guardarAsignacionManual(): void {
    const tutorId = this.tutorPicklistId;
    if (!tutorId) return;

    const originalIds = new Set(this.picklistOriginalTarget.map(e => e.estudianteId));
    const currentIds = new Set(this.picklistTarget.map(e => e.estudianteId));
    const agregados = this.picklistTarget.filter(e => !originalIds.has(e.estudianteId));
    const removidos = this.picklistOriginalTarget.filter(e => !currentIds.has(e.estudianteId));

    if (agregados.length === 0 && removidos.length === 0) {
      this.dialogPicklistVisible.set(false);
      return;
    }

    this.guardando.set(true);
    const ops$ = [
      ...agregados.map(e => this.tutorEstudianteService.asignarTutor({ tutorId: tutorId!, estudianteId: e.estudianteId })),
      ...removidos.filter(e => e.asignacionId != null).map(e => this.tutorEstudianteService.desactivarAsignacion(e.asignacionId!))
    ];

    forkJoin(ops$).subscribe({
      next: () => {
        this.guardando.set(false);
        this.dialogPicklistVisible.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Guardado',
          detail: `${agregados.length} asignado(s), ${removidos.length} removido(s)`,
          life: 3000
        });
        this.cargarDatos();
      },
      error: () => {
        this.guardando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ocurrió un error al guardar los cambios', life: 3000 });
        this.cargarDatos();
      }
    });
  }

  // Asignación rápida desde estudiante sin tutor
  abrirAsignarEstudiante(estudiante: EstudianteItem): void {
    this.estudianteParaAsignar = estudiante;
    this.tutorRapidoId = null;
    this.dialogAsignarVisible.set(true);
  }

  confirmarAsignarEstudiante(): void {
    const tutorId = this.tutorRapidoId;
    const estudiante = this.estudianteParaAsignar;
    if (!tutorId || !estudiante) return;

    this.asignandoRapido.set(true);
    this.tutorEstudianteService.asignarTutor({ tutorId, estudianteId: estudiante.estudianteId }).subscribe({
      next: (nueva) => {
        this.asignandoRapido.set(false);
        this.dialogAsignarVisible.set(false);
        this.asignaciones.update(list => [...list, nueva]);
        this.estudiantesSinTutor.update(list => list.filter(e => e.estudianteId !== estudiante.estudianteId));
        this.messageService.add({ severity: 'success', summary: 'Asignado', detail: `${estudiante.nombre} asignado correctamente`, life: 3000 });
      },
      error: (err) => {
        this.asignandoRapido.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.message ?? 'No se pudo realizar la asignación', life: 3000 });
      }
    });
  }

  confirmarRemover(asignacion: TutorEstudianteDTO): void {
    this.confirmationService.confirm({
      message: `¿Remover a <strong>${asignacion.nombreEstudiante}</strong> del tutor <strong>${asignacion.nombreTutor}</strong>?`,
      header: 'Remover asignación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.removerAsignacion(asignacion)
    });
  }

  private removerAsignacion(asignacion: TutorEstudianteDTO): void {
    this.tutorEstudianteService.desactivarAsignacion(asignacion.id).subscribe({
      next: () => {
        this.asignaciones.update(list => list.filter(a => a.id !== asignacion.id));
        this.estudiantesSinTutor.update(list =>
          [...list, { estudianteId: asignacion.estudianteId, nombre: asignacion.nombreEstudiante, correo: asignacion.correoEstudiante }]
            .sort((a, b) => a.nombre.localeCompare(b.nombre))
        );
        this.messageService.add({ severity: 'success', summary: 'Removido', detail: 'Asignación removida', life: 3000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo remover la asignación', life: 3000 });
      }
    });
  }

  normalizar(texto: string): string {
    return texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  getIniciales(nombre: string): string {
    const partes = nombre.trim().split(' ');
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : nombre.substring(0, 2).toUpperCase();
  }
}
