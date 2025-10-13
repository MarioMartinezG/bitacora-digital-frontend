import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG modules
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { forkJoin } from 'rxjs';

// PrimeNG servicess
import { Table } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';

// Componentes
import { TeachingStaffService, TeachingStaff } from '../../../../../core/services/teachingstaff.service';


@Component({
    selector: 'app-teachingstaffwidget',
    standalone: true,
    templateUrl: './teachingstaffwidget.html',
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToolbarModule,
        DialogModule,
        InputTextModule,
        SelectModule,
        RadioButtonModule,
        InputNumberModule,
        ConfirmDialogModule,
        ToastModule,
        RippleModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        DatePicker,
        MultiSelectModule
    ],
    providers: [MessageService, ConfirmationService]
})
export class Teachingstaffwidget implements OnInit {

    teacherDialog: boolean = false;
    teachers = signal<TeachingStaff[]>([]);
    teacher!: TeachingStaff;
    selectedTeachers!: TeachingStaff[] | null;
    submitted: boolean = false;
    cols!: any[];
    selectedTeachingStaff: TeachingStaff[] = [];


    currentTeachingStaff: TeachingStaff = {
        rol: '',
        name: '',
        email: '',
        attention: '',
        days: [],
        startTime: new Date(),
        endTime: new Date(),
        schedule: '',
        site: ''
    };
    teachingStaffDialog: boolean = false;

    @ViewChild('dt') dt!: Table;

    constructor(
        private teachingStaffService: TeachingStaffService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.cols = [
            { field: 'rol', header: 'Cargo' },
            { field: 'name', header: 'Nombre' },
            { field: 'email', header: 'Correo' },
            { field: 'attention', header: 'Atención' },
            { field: 'days', header: 'Días' },
            { field: 'schedule', header: 'Horario' },
            { field: 'site', header: 'Lugar asignado' }
        ];

        this.loadTeachers();
    }

    loadTeachers() {
        this.teachingStaffService.getTeachingStaffData().subscribe(data => {
            this.teachers.set(data || []);
        });
    }

    openNew() {
        this.teacher = {
            rol: '',
            name: '',
            email: '',
            attention: '',
            days: [],
            startTime: new Date(),
            endTime: new Date(),
            schedule: '',
            site: ''
        };
        this.submitted = false;
        this.teacherDialog = true;
    }


    editTeacher(teacher: TeachingStaff) {
        this.teacher = { ...teacher };
        this.teacherDialog = true;
    }

    hideDialog() {
        this.teacherDialog = false;
        this.submitted = false;
    }

    saveTeacher() {
        this.submitted = true;

        if (!this.teacher.name?.trim()) return;

        if (this.teacher.id) {
            this.teachingStaffService.updateTeacher(this.teacher)
                .subscribe(() => {
                    this.messageService.add({ severity: 'success', summary: 'Actualizado', detail: 'Docente actualizado', life: 3000 });
                    this.loadTeachers();
                    this.teacherDialog = false;
                });
        } else {
            this.teachingStaffService.createTeacher(this.teacher)
                .subscribe(() => {
                    this.messageService.add({ severity: 'success', summary: 'Creado', detail: 'Docente agregado', life: 3000 });
                    this.loadTeachers();
                    this.teacherDialog = false;
                });
        }
    }


    deleteSelectedTeachers() {
        this.confirmationService.confirm({
            message: '¿Deseas eliminar los registros seleccionados?',
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (this.selectedTeachingStaff?.length) {
                    const deletes$ = this.selectedTeachingStaff
                        .filter(t => t.id)
                        .map(t => this.teachingStaffService.deleteTeacher(t.id!));

                    forkJoin(deletes$).subscribe(() => {
                        this.loadTeachers();
                        this.selectedTeachingStaff = [];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Eliminado',
                            detail: 'Registros eliminados',
                            life: 3000
                        });
                    });
                }
            }
        });
    }



    deleteTeacher(teacher: TeachingStaff) {
        this.confirmationService.confirm({
            message: `¿Deseas eliminar a ${teacher.name}?`,
            header: 'Confirmar',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                if (teacher.id) {
                    this.teachingStaffService.deleteTeacher(teacher.id)
                        .subscribe(() => {
                            this.loadTeachers();
                            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Docente eliminado', life: 3000 });
                        });
                }
            }
        });
    }
    roles: { label: string; value: string }[] = [
        { label: 'Coordinador', value: 'Coordinador' },
        { label: 'Docente / Tutor', value: 'Docente / Tutor' },
        { label: 'Docente / Laboratorio', value: 'Docente / Laboratorio' },
        { label: 'Docente / Invitado', value: 'Docente / Invitado' },
        { label: 'Estudiante / Monitor', value: 'Estudiante / Monitor' }
    ];

    daysOptions = [
        { label: 'Lunes', value: 'Lunes' },
        { label: 'Martes', value: 'Martes' },
        { label: 'Miércoles', value: 'Miércoles' },
        { label: 'Jueves', value: 'Jueves' },
        { label: 'Viernes', value: 'Viernes' },
        { label: 'Sábado', value: 'Sábado' },
        { label: 'Cita previa', value: 'Cita previa' }
    ];
    updateSchedule() {
        if (this.teacher.startTime && this.teacher.endTime) {
            const startStr = this.teacher.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endStr = this.teacher.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            this.teacher.schedule = `${startStr} - ${endStr}`;
        } else {
            this.teacher.schedule = '';
        }
    }
    onDaysChange(selectedDays: string[]) {
        this.teacher.days = selectedDays;
        if (selectedDays.includes('Cita previa')) {
            this.teacher.schedule = '';
        }
    }
    getFormattedSchedule(teacher: TeachingStaff): string {
        if (!teacher.startTime || !teacher.endTime || teacher.days.includes('Cita previa')) {
            return '-';
        }

        const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        const start = teacher.startTime.toLocaleTimeString([], options);
        const end = teacher.endTime.toLocaleTimeString([], options);
        return `${start} - ${end}`;
    }


}
