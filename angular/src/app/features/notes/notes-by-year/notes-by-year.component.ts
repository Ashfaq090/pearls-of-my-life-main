import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, Subject, takeUntil, tap } from 'rxjs';
import { NotesService } from '../notes.service';
import { SharedService } from 'src/app/services/shared.service';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { ManageNotesComponent } from '../manage-notes/manage-notes.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { objectToQueryParams } from 'src/app/constants/app.constant';

@Component({
  selector: 'app-notes-by-year',
  templateUrl: './notes-by-year.component.html',
  styleUrls: ['./notes-by-year.component.scss']
})
export class NotesByYearComponent implements OnInit, OnDestroy {

  public notesList: any[] = [];
  public notesListByMonths: any[] = [];
  public year: any;
  private pageOptions: any = {
    pageSize: 20,
    page: 1,
    pagination: true
  };
  private scrollListener: any;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly notesService: NotesService,
    private readonly ngbModalService: NgbModal,
    private readonly sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.year = params.get('year'); // '123'
      this.getNotesByYear();
    });

    this.scrollListener = this.onScroll.bind(this);
    window.addEventListener('scroll', this.scrollListener);
  }

  ngOnDestroy() {
    this.removeScrollListener();
  }

  removeScrollListener() {
    window.removeEventListener('scroll', this.scrollListener);
  }

  onScroll() {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    if (scrollPosition >= documentHeight) {
      ++this.pageOptions.page;
      this.getNotesByYear();
    }
  }

  getNotesByYear() {
    this.pageOptions['year'] = this.year;
    console.log(this.pageOptions);
    const queryParams = objectToQueryParams(this.pageOptions);
    this.notesService.getNotes(queryParams).subscribe({
      next: (response) => {
        if (response?.data && response?.data?.length) {
          this.notesList = [];
          this.notesList.push(...response.data);
          this.arrangeListByMonths();
        }
        else {
          this.removeScrollListener()
        }
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      }
    });
  }

  arrangeListByMonths() {
    this.notesListByMonths = [];
    let i = 12;
    while (i > 0) {
      const list = this.notesList.filter(x => i == (new Date(x.note_date).getMonth() + 1));
      if (list.length) {
        this.notesListByMonths.push(list);
      }
      i--;
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
        this.getNotesByYear();
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
      text: 'Are you sure you want to delete this note? This action is permanent and cannot be undone'
    }

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
        this.getNotesByYear();
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      }
    });
  }

}
