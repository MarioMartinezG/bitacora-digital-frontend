import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import { AppMenuitem } from './app.menuitem';
import { LoginService, MenuService, ToastService } from '../../core/services';
import { ApiError } from '../../core/models';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule, ToastModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of menu; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
        <p-toast />
    </ul> `
})
export class AppMenu {
    menu: MenuItem[] = [];

    constructor(
        private menuService: MenuService, 
        private toastService: ToastService,
        private loginService: LoginService
    ) { }

    ngOnInit() {

        const userRole:number = this.loginService.getUser().role;

        console.log('UserRole', userRole);

        this.menuService.getMenuByRole(userRole).subscribe({
            next: (menu) => {
                this.menu = menu;
            },
            error: (errorResponse: ApiError) => {
                this.toastService.showError(errorResponse.error, errorResponse.message);
            }
        });
    }
}
