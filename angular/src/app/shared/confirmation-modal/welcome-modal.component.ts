import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome-modal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome-modal.component.html',
  styleUrls: ['./welcome-modal.component.scss'],
})
export class WelcomeModalComponent {
  constructor(
    public readonly activeModal: NgbActiveModal,
    private readonly router: Router
  ) {}

  close(): void {
    this.activeModal.close();
  }

  dismiss(): void {
    this.activeModal.dismiss();
  }

  goToKeyHolders(): void {
    this.activeModal.close();
    this.router.navigate(['/key-holders'], { queryParams: { openAdd: '1' } });
  }
}
