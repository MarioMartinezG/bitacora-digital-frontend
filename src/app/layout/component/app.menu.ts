import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { MenuService, ToastService } from '../../core/services';
import { ApiError } from '../../core/models';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of menu; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    menu: MenuItem[] = [];

    constructor(private menuService: MenuService, private toastService: ToastService) { }

    ngOnInit() {
        this.menuService.getMenuByRole(1).subscribe({
            next: (menu) => {
                this.menu = menu;
            },
            error: (err: ApiError) => {
                console.error(`Error: ${err.status} - ${err.message}`);
            }
        });
    }
}
