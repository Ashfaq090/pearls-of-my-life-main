import { SoundService } from 'src/app/services/sound.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AddItemsCardComponent } from '../add-items-card/add-items-card.component';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-obituary-card',
  standalone: true,
  imports: [CommonModule, AddItemsCardComponent],
  templateUrl: './obituary-card.component.html',
  styleUrls: ['./obituary-card.component.scss'],
})
export class ObituaryCardComponent implements OnChanges {
  @Input() items: any[] = [];
  @Input() showAll: boolean = false;
  public itemsList: any[] = [];
  @Output() readonly editObituary = new EventEmitter<any>();
  @Output() readonly deleteObituary = new EventEmitter<any>();
  @Output() readonly seeMore = new EventEmitter<any>();
  constructor(
    private soundService: SoundService,
    private sharedService: SharedService
  ) {}
  ngOnChanges(simpleChange: SimpleChanges): void {
    const items = simpleChange['items']?.currentValue || [];
    this.itemsList =
      !this.showAll && items?.length > 6 ? items.slice(0, 5) : items;
  }
  public isKeyHolder: boolean = this.sharedService.isKeyHolder();
  edit(obituary: any) {
    this.editObituary.emit(obituary);
  }

  delete(obituary: any) {
    this.soundService.playClickSound();
    this.deleteObituary.emit(obituary);
  }

  redirectToYear(year: string) {
    this.seeMore.emit(year);
  }
}
