import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        DIGINEXA -
        <a href="https://www.unbosque.edu.co" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Universidad El Bosque</a>
    </div>`
})
export class AppFooter {}
