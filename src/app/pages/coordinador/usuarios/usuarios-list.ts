import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Usuario, ImportarUsuariosResponse } from '../../../core/models';
import { UserRole, ROLE_LABELS } from '../../../core/models/role.model';
import { UsuariosService } from '../../../core/services/usuarios.service';

@Component({
  selector: 'app-usuarios-list',
  templateUrl: './usuarios-list.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    SkeletonModule,
    DialogModule,
    TabsModule,
    SelectModule,
    MultiSelectModule,
    PasswordModule
  ],
  providers: [MessageService, ConfirmationService]
})
export class UsuariosList implements OnInit {
  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);

  // === Filtros por tab ===
  busquedaEstudiante = signal('');
  filtroEstadoEstudiante = signal<string>('todos');
  busquedaGraduado = signal('');
  busquedaTutor = signal('');

  estadoOptions = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activo', value: 'activo' },
    { label: 'Inactivo', value: 'inactivo' }
  ];

  // === Datos base por tipo ===
  estudiantesBase = computed(() =>
    this.usuarios().filter(u => u.roles.includes(UserRole.ESTUDIANTE) && !u.graduado)
  );
  graduadosBase = computed(() =>
    this.usuarios().filter(u => u.graduado === true)
  );
  tutoresBase = computed(() =>
    this.usuarios().filter(u =>
      u.roles.includes(UserRole.TUTOR) || u.roles.includes(UserRole.COORDINADOR)
    )
  );

  // === Listas filtradas ===
  estudiantesFiltrados = computed(() => {
    let lista = this.estudiantesBase();
    const busqueda = this.busquedaEstudiante().toLowerCase().trim();
    const estado = this.filtroEstadoEstudiante();
    if (busqueda) lista = lista.filter(u =>
      u.nombre.toLowerCase().includes(busqueda) || u.correo.toLowerCase().includes(busqueda)
    );
    if (estado === 'activo') lista = lista.filter(u => u.activo);
    if (estado === 'inactivo') lista = lista.filter(u => !u.activo);
    return lista;
  });

  graduadosFiltrados = computed(() => {
    const busqueda = this.busquedaGraduado().toLowerCase().trim();
    let lista = this.graduadosBase();
    if (busqueda) lista = lista.filter(u =>
      u.nombre.toLowerCase().includes(busqueda) || u.correo.toLowerCase().includes(busqueda)
    );
    return lista;
  });

  tutoresFiltrados = computed(() => {
    const busqueda = this.busquedaTutor().toLowerCase().trim();
    let lista = this.tutoresBase();
    if (busqueda) lista = lista.filter(u =>
      u.nombre.toLowerCase().includes(busqueda) || u.correo.toLowerCase().includes(busqueda)
    );
    return lista;
  });

  // === Dialog importar CSV ===
  dialogImportarVisible = signal(false);
  archivoSeleccionado = signal<File | null>(null);
  importando = signal(false);
  resultadoImportacion = signal<ImportarUsuariosResponse | null>(null);

  // === Dialog formulario usuario ===
  dialogFormVisible = signal(false);
  isEditMode = signal(false);
  editUsuarioId = signal<number | null>(null);
  guardando = signal(false);
  form!: FormGroup;

  rolesOptions = [
    { label: ROLE_LABELS[UserRole.ESTUDIANTE], value: UserRole.ESTUDIANTE },
    { label: ROLE_LABELS[UserRole.TUTOR], value: UserRole.TUTOR },
    { label: ROLE_LABELS[UserRole.COORDINADOR], value: UserRole.COORDINADOR }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsuarios();
  }

  private initForm(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: [''],
      roles: [[] as number[], Validators.required]
    });
  }

  loadUsuarios(): void {
    this.cargando.set(true);
    this.usuariosService.listarUsuarios().subscribe({
      next: (data) => { this.usuarios.set(data); this.cargando.set(false); },
      error: () => {
        this.cargando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios', life: 3000 });
      }
    });
  }

  nuevoUsuario(): void {
    this.isEditMode.set(false);
    this.editUsuarioId.set(null);
    this.form.reset({ nombre: '', correo: '', contrasena: '', roles: [] });
    this.dialogFormVisible.set(true);
  }

  editarUsuario(u: Usuario): void {
    this.isEditMode.set(true);
    this.editUsuarioId.set(u.id);
    this.form.reset({ nombre: u.nombre, correo: u.correo, contrasena: '', roles: u.roles });
    this.dialogFormVisible.set(true);
  }

  cerrarDialogForm(): void {
    this.dialogFormVisible.set(false);
  }

  onSubmitForm(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const formData = this.form.value;

    if (this.isEditMode()) {
      this.usuariosService.actualizarUsuario(this.editUsuarioId()!, formData).subscribe({
        next: () => {
          this.guardando.set(false);
          this.dialogFormVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Usuario actualizado correctamente', life: 3000 });
          this.loadUsuarios();
        },
        error: () => {
          this.guardando.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el usuario', life: 3000 });
        }
      });
    } else {
      this.usuariosService.crearUsuario(formData).subscribe({
        next: () => {
          this.guardando.set(false);
          this.dialogFormVisible.set(false);
          this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Usuario creado correctamente', life: 3000 });
          this.loadUsuarios();
        },
        error: () => {
          this.guardando.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el usuario', life: 3000 });
        }
      });
    }
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  verDetalle(u: Usuario): void { this.router.navigate(['/home/coordinador/usuarios', u.id]); }
  verBitacora(u: Usuario): void { this.router.navigate(['/home/coordinador/bitacoras', u.id]); }

  confirmarToggleActivo(usuario: Usuario): void {
    const accion = usuario.activo ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      message: `¿Deseas ${accion} al usuario <strong>${usuario.nombre}</strong>?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí', rejectLabel: 'No',
      accept: () => this.toggleActivo(usuario)
    });
  }

  confirmarGraduar(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `¿Marcar a <strong>${usuario.nombre}</strong> como graduado? El usuario ya no podrá iniciar sesión.`,
      header: 'Marcar como Graduado',
      icon: 'pi pi-star',
      acceptLabel: 'Sí, graduar', rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.marcarGraduado(usuario)
    });
  }

  confirmarReactivar(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `¿Reactivar a <strong>${usuario.nombre}</strong>? Se revertirá su estado de graduado.`,
      header: 'Reactivar Usuario',
      icon: 'pi pi-replay',
      acceptLabel: 'Sí, reactivar', rejectLabel: 'Cancelar',
      accept: () => this.reactivar(usuario)
    });
  }

  private toggleActivo(usuario: Usuario): void {
    this.usuariosService.toggleActivo(usuario.id).subscribe({
      next: () => {
        const accion = !usuario.activo ? 'activado' : 'desactivado';
        this.usuarios.update(list => list.map(u => u.id === usuario.id ? { ...u, activo: !u.activo } : u));
        this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: `Usuario ${accion} correctamente`, life: 3000 });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el usuario', life: 3000 })
    });
  }

  private marcarGraduado(usuario: Usuario): void {
    this.usuariosService.marcarGraduado(usuario.id).subscribe({
      next: () => {
        this.usuarios.update(list => list.map(u => u.id === usuario.id ? { ...u, graduado: true, activo: false } : u));
        this.messageService.add({ severity: 'success', summary: 'Graduado', detail: `${usuario.nombre} marcado como graduado`, life: 3000 });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo graduar al usuario', life: 3000 })
    });
  }

  private reactivar(usuario: Usuario): void {
    this.usuariosService.reactivar(usuario.id).subscribe({
      next: () => {
        this.usuarios.update(list => list.map(u => u.id === usuario.id ? { ...u, graduado: false, activo: true } : u));
        this.messageService.add({ severity: 'success', summary: 'Reactivado', detail: `${usuario.nombre} reactivado correctamente`, life: 3000 });
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo reactivar al usuario', life: 3000 })
    });
  }

  // === CSV Import ===
  descargarPlantillaCsv(): void {
    const contenido = 'nombre,correo,roles';
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_usuarios.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  abrirDialogImportar(): void {
    this.archivoSeleccionado.set(null);
    this.resultadoImportacion.set(null);
    this.dialogImportarVisible.set(true);
  }
  cerrarDialogImportar(): void { this.dialogImportarVisible.set(false); }

  onArchivoSeleccionado(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.archivoSeleccionado.set(file);
  }

  importarCsv(): void {
    const archivo = this.archivoSeleccionado();
    if (!archivo) return;
    this.importando.set(true);
    this.usuariosService.importarCsv(archivo).subscribe({
      next: (resultado) => {
        this.importando.set(false);
        this.resultadoImportacion.set(resultado);
        if (resultado.creados > 0) this.loadUsuarios();
      },
      error: () => {
        this.importando.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al procesar el archivo CSV', life: 3000 });
      }
    });
  }

  // === Helpers ===
  getRolLabel(rolId: number): string { return ROLE_LABELS[rolId as UserRole] || 'Desconocido'; }

  getRolSeverity(rolId: number): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (rolId) {
      case UserRole.ESTUDIANTE: return 'info';
      case UserRole.TUTOR: return 'success';
      case UserRole.COORDINADOR: return 'warn';
      default: return 'secondary';
    }
  }

  getEstadoLabel(u: Usuario): string {
    if (u.graduado) return 'Graduado';
    return u.activo ? 'Activo' : 'Inactivo';
  }

  getEstadoSeverity(u: Usuario): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (u.graduado) return 'contrast';
    return u.activo ? 'success' : 'danger';
  }

  formatFecha(fecha?: string): string {
    if (!fecha) return 'Sin registro';
    return new Date(fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
