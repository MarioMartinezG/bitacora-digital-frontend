import { Injectable } from '@angular/core';
import { Observable, Subject, of } from 'rxjs';

export interface TeachingStaff {
    id?: number;
    rol: string;
    name: string;
    email: string;
    attention: string;
    days: string[];
    startTime?: Date | null;
    endTime?: Date | null;
    schedule?: string;
    site: string;
}

@Injectable({
    providedIn: 'root'
})
export class TeachingStaffService {
    private teachers: TeachingStaff[] = [];
    private idCounter = 1;

    /** Emite cuando los datos cambian por operaciones CRUD (no en carga inicial) */
    private dataChanged = new Subject<void>();
    dataChanged$ = this.dataChanged.asObservable();

    constructor() { }

    /**
     * Carga datos desde el JSON guardado en base de datos.
     * Convierte strings ISO de fechas a objetos Date.
     * NO emite dataChanged$ para evitar disparar auto-save en la carga inicial.
     */
    loadFromData(teachers: TeachingStaff[]): void {
        this.teachers = (teachers || []).map(t => ({
            ...t,
            startTime: t.startTime ? new Date(t.startTime) : null,
            endTime: t.endTime ? new Date(t.endTime) : null
        }));
        this.idCounter = this.teachers.length
            ? Math.max(...this.teachers.filter(t => t.id).map(t => t.id!)) + 1
            : 1;
    }

    /** Retorna el estado actual para incluir en el JSON de guardado */
    getData(): TeachingStaff[] {
        return [...this.teachers];
    }

    getTeachingStaffData(): Observable<TeachingStaff[]> {
        return of(this.teachers);
    }

    createTeacher(teacher: TeachingStaff): Observable<void> {
        teacher.id = this.idCounter++;
        this.teachers.push(teacher);
        this.dataChanged.next();
        return of(void 0);
    }

    updateTeacher(teacher: TeachingStaff): Observable<void> {
        const index = this.teachers.findIndex(t => t.id === teacher.id);
        if (index !== -1) {
            this.teachers[index] = { ...teacher };
        }
        this.dataChanged.next();
        return of(void 0);
    }

    deleteTeacher(id: number): Observable<void> {
        this.teachers = this.teachers.filter(t => t.id !== id);
        this.dataChanged.next();
        return of(void 0);
    }
}
