import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-auto-obituary-modal',
  templateUrl: './auto-obituary-modal.component.html',
  styleUrls: ['./auto-obituary-modal.component.scss'],
})
export class AutoObituaryModalComponent {
  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly router: Router
  ) {}

  dismiss(): void {
    this.activeModal.dismiss();
  }

  goToObituaryInfo(): void {
    this.activeModal.close(null);
    this.router.navigate(['/obituary-info'], { queryParams: { openAdd: '1' } });
  }
}
