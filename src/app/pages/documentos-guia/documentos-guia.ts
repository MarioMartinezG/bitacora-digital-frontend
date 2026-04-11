import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Documento {
  label: string;
  nombre: string;
  url: string;
}

@Component({
  selector: 'app-documentos-guia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'documentos-guia.html',
})
export class DocumentosGuia {
  documentos: Documento[] = [
    {
      label: 'Unidad 1 - Punto de Partida',
      nombre: 'unidad-1-punto-de-partida-2026-1-njCH6iYM.pdf',
      url: '/assets/recursos/unidad-1-punto-de-partida-2026-1-njCH6iYM.pdf'
    },
    {
      label: 'Unidad 2 - Contexto UEB',
      nombre: 'unidad-2-contexto-ueb-2026-1-_Sm9zuEa.pdf',
      url: '/assets/recursos/unidad-2-contexto-ueb-2026-1-_Sm9zuEa.pdf'
    },
    {
      label: 'Unidad 3 - Diseño de cursos para el Éxito Académico',
      nombre: 'unidad-3-diseno-de-cursos-para-el-exito-academico-2026-Fg5MjKKg.pdf',
      url: '/assets/recursos/unidad-3-diseno-de-cursos-para-el-exito-academico-2026-Fg5MjKKg.pdf'
    }
  ];
}
