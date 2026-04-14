import { Component, OnInit } from '@angular/core';
import {
  ADD_ITEMS_LIST,
  objectToQueryParams,
} from 'src/app/constants/app.constant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ManageNotesComponent } from './manage-notes/manage-notes.component';
import { NotesService } from './notes.service';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { SharedService } from 'src/app/services/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
})
export class NotesComponent implements OnInit {
  constructor(
    private readonly notesService: NotesService,
    private readonly ngbModalService: NgbModal,
    private readonly sharedService: SharedService,
    private readonly router: Router
  ) {}

  public notes: any[] = [];
  public notesListByYear: any[] = [];
  public addCardItems: any = [ADD_ITEMS_LIST.NOTES];
  private pageOptions: any = {
    pageSize: 20,
    page: 1,
    pagination: false,
  };

  ngOnInit(): void {
    this.getNotes();
  }

  getNotes() {
    const queryParams = objectToQueryParams(this.pageOptions);
    this.notesService.getNotes(queryParams).subscribe({
      next: (response) => {
        this.notes = response.data;
        if (this.notes && this.notes.length)
          this.arrangeNotesByYear(response.data);
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }

  arrangeNotesByYear(notes: any) {
    //debugger;
    this.notesListByYear = [];
    let startYear = new Date(notes[0].note_date).getFullYear();
    let endYear = new Date(notes[notes.length - 1].note_date).getFullYear();
    while (startYear >= endYear) {
      const list = this.notes.filter(
        (x) => startYear == new Date(x.note_date).getFullYear()
      );
      if (list.length) {
        this.notesListByYear.push(list);
      }
      startYear--;
    }
  }

  openNotePopup(item: any) {
    // Open the modal
    const modalRef = this.ngbModalService.open(ManageNotesComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    // Set the modal data
    modalRef.componentInstance.data = {
      name: item?.id ? 'Edit' : 'Add',
      item: item?.id ? item : null,
    };

    // Handle the modal result
    modalRef.result
      .then((result) => {
        this.getNotes();
      })
      .catch((error) => console.log(error));
  }

  openDeleteDialog(note: any) {
    const modalRef = this.ngbModalService.open(ConfirmationModalComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    modalRef.componentInstance.data = {
      title: 'Delete Note',
      text: 'Are you sure you want to delete this note? This action is permanent and cannot be undone',
    };

    modalRef.result
      .then((result) => {
        this.deleteNote(note.id);
      })
      .catch((error) => console.log(note));
  }

  deleteNote(note_id: string) {
    this.notesService.deleteNote(note_id).subscribe({
      next: (response) => {
        this.sharedService.showToast({
          classname: 'success',
          text: response?.message,
        });
        this.getNotes();
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }

  seeMore(year: any) {
    this.router.navigate([`/notes/${year}`]);
  }
}
