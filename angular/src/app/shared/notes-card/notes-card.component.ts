import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AddItemsCardComponent } from '../add-items-card/add-items-card.component';

@Component({
  selector: 'app-notes-card',
  standalone: true,
  imports: [CommonModule, AddItemsCardComponent],
  templateUrl: './notes-card.component.html',
  styleUrls: ['./notes-card.component.scss']
})
export class NotesCardComponent implements OnChanges {

  @Input() items: any[] = [];
  @Input() showAll: boolean = false;
  public itemsList: any[] = [];
  @Output() readonly editNote = new EventEmitter<any>();
  @Output() readonly deleteNote = new EventEmitter<any>();
  @Output() readonly seeMore = new EventEmitter<any>();

  ngOnChanges(simpleChange: SimpleChanges): void {

    const items = simpleChange['items'].currentValue || [];
    this.itemsList = (!this.showAll && items?.length > 6) ? items.slice(0, 5) : items;

  }

  edit(note: string) {
    this.editNote.emit(note)
  }

  delete(note: string) {
    this.deleteNote.emit(note)
  }

  redirectToYear(year: string) {
    this.seeMore.emit(year)
  }

}
