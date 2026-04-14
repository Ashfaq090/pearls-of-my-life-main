import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnChanges {

  @Input() data: any;

  constructor(
    private readonly activeModal: NgbActiveModal,
  ) { }

  ngOnChanges(simpleChange: SimpleChanges): void {
    console.log({ simpleChange });
    // this.images = (!this.showAll && items?.length > 6) ? items.slice(0, 5) : items;

  }


  closeModal(): void {
    this.activeModal.close(null);
  }

}
