import { Injectable } from '@angular/core';
import { Observable, of, forkJoin  } from 'rxjs';

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
    private teachers: TeachingStaff[] = [
        {
            id: 1,
            rol: 'Docente',
            name: 'Laura Pérez',
            email: 'laura.perez@unbosque.edu.co',
            attention: 'Presencial',
            days: ['Lunes', 'Miércoles'],
            startTime: new Date(0, 0, 0, 9, 0),
            endTime: new Date(0, 0, 0, 11, 0),
            schedule: '9:00 - 11:00 AM',
            site: 'Bloque A, Aula 203'
        },
        {
            id: 2,
            rol: 'Coordinador',
            name: 'Carlos Ramírez',
            email: 'carlos.ramirez@unbosque.edu.co',
            attention: 'Virtual',
            days: ['Martes', 'Jueves'],
            startTime: new Date(0, 0, 0, 14, 0), // 2:00 PM
            endTime: new Date(0, 0, 0, 16, 0),   // 4:00 PM
            schedule: '2:00 - 4:00 PM',
            site: 'https://teams.microsoft.com/l/meetup-join/12345'
        }
    ];

    private idCounter = 3;

    constructor() { }
  // Obtener todos los docentes
    getTeachingStaffData(): Observable<TeachingStaff[]> {
        return of(this.teachers);
    }

 // Crear un docente
    createTeacher(teacher: TeachingStaff): Observable<void> {
        teacher.id = this.idCounter++;
        this.teachers.push(teacher);
        return of(void 0);
    }

    // Actualizar un docente
    updateTeacher(teacher: TeachingStaff): Observable<void> {
        const index = this.teachers.findIndex(t => t.id === teacher.id);
        if (index !== -1) {
            this.teachers[index] = { ...teacher };
        }
        return of(void 0);
    }

    // Eliminar un docente
    deleteTeacher(id: number): Observable<void> {
        this.teachers = this.teachers.filter(t => t.id !== id);
        return of(void 0);
    }
}
