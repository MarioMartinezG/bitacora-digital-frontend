import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BlockUIModule } from 'primeng/blockui';

import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [BlockUIModule, ProgressSpinnerModule],
  templateUrl: './loading.html',
})
export class LoadingComponent {
  loading: boolean = false;

  constructor(
    private loadingService: LoadingService
  ) {
    this.loadingService.loading$.subscribe(state => this.loading = state);
  }

}
