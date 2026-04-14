import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-add-items-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './add-items-card.component.html',
  styleUrls: ['./add-items-card.component.scss'],
})
export class AddItemsCardComponent {
  constructor(private sounService: SoundService) {}
  @Input() items: any[];
  @Output() readonly label = new EventEmitter<any>();

  emit(component: string) {
    this.sounService.playClickSound();
    this.label.emit({ component });
  }
}
