import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];

    ngOnInit() {
        this.model = [
            {
                label: 'Inicio',
                items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-clipboard', routerLink: ['/home'] }]
            },
            {
                label: 'Bitácora Digital',
                items: [
                    { label: 'Caracteriza tu Asignatura', icon: 'pi pi-fw pi-id-card', routerLink: ['/home/bitacora/caracteriza-asignatura'] },
                    { label: 'Factores Situacionales', icon: 'pi pi-fw pi-arrow-up-right-and-arrow-down-left-from-center', routerLink: ['/home/bitacora/factores-situacionales'] },
                    { label: 'Ajustes Razonables', icon: 'pi pi-fw pi-wrench', class: 'rotated-icon', routerLink: ['/home/bitacora/ajustes-razonables'] },
                    { label: 'RAP y RAC', icon: 'pi pi-fw pi-table', routerLink: ['/home/bitacora/rap-rac'] },
                    { label: 'Actividades de Aprendizaje', icon: 'pi pi-fw pi-list', routerLink: ['/home/bitacora/actividades-aprendizaje'] },
                    { label: 'Cómo Evaluaré', icon: 'pi pi-fw pi-trophy', routerLink: ['/home/bitacora/como-evaluare'] },
                    { label: 'Secuencia del Curso', icon: 'pi pi-fw pi-angle-double-right', routerLink: ['/home/bitacora/secuencia-curso'] },
                    { label: 'Bibliografía y medios educativos', icon: 'pi pi-fw pi-book', routerLink: ['/home/bitacora/bibliografia'] }
                ]
            }
        ];
    }
}
