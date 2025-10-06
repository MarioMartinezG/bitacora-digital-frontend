import { Component } from '@angular/core';

// Componentes
import { LoadingComponent } from '../../../utils/loading/loading';

// Modelos
import { Reference } from '../../../core/models';

// Componentes PrimeNG
import { FluidModule } from 'primeng/fluid';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-bibliografia-component',
  standalone: true,
  imports: [
    FluidModule,
    CardModule,
    AccordionModule,
    ToolbarModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    LoadingComponent,
  ],
  templateUrl: './bibliografia-component.html',
})
export class BibliografiaComponent {

  references: Reference[] = [
    { id: 1, text: 'Nichols, T. (2017). The death of expertise: The campaign against established knowledge and why it matters. Oxford University Press.' },
    { id: 2, text: 'Tavani, H. T. (2016). Ethics and technology: Controversies, questions, and strategies for ethical computing (5th ed.). Wiley.' },
    { id: 3, text: 'Anderson, C. (2008). The long tail: Why the future of business is selling less of more. Hyperion.' },
  ];
  referenceDialog: boolean = false;
  submitted: boolean = false;
  reference: Reference = { id: 0, text: '' };
  isEdit: boolean = false;

  // Abrir diálogo para nuevo registro
  openNew() {
    this.reference = { id: 0, text: '' };
    this.submitted = false;
    this.referenceDialog = true;
    this.isEdit = false;
  }

  // Editar referencia existente
  editReference(ref: Reference) {
    this.reference = { ...ref };
    this.referenceDialog = true;
    this.isEdit = true;
  }

  // Guardar (nuevo o editado)
  saveReference() {
    this.submitted = true;

    if (!this.reference.text.trim()) return;

    if (this.isEdit) {
      const index = this.references.findIndex(r => r.id === this.reference.id);
      this.references[index] = this.reference;
    } else {
      this.reference.id = this.references.length > 0
        ? Math.max(...this.references.map(r => r.id)) + 1
        : 1;
      this.references.push(this.reference);
    }

    this.references = [...this.references]; // refresca la tabla
    this.referenceDialog = false;
    this.reference = { id: 0, text: '' };
  }

  // Eliminar
  deleteReference(ref: Reference) {
    this.references = this.references.filter(r => r.id !== ref.id);
  }

  hideDialog() {
    this.referenceDialog = false;
    this.submitted = false;
  }
}
