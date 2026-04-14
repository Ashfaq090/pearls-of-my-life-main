import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  NgbActiveModal,
  NgbDatepickerModule,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import { NotesService } from '../notes.service';
import {
  dateToIsoString,
  isoStringToDateObj,
} from 'src/app/constants/app.constant';
import { SharedService } from 'src/app/services/shared.service';
import { CustomDateParserFormatter } from 'src/app/shared/services/custom-date-parser-formatter.service';

@Component({
  selector: 'app-manage-notes',
  templateUrl: './manage-notes.component.html',
  styleUrls: ['./manage-notes.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }],
})
export class ManageNotesComponent implements OnInit {
  public noteForm: FormGroup;
  @Input() data: any = {};

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly notesService: NotesService,
    private readonly sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.noteForm = this.formBuilder.group({
      heading: ['', [Validators.required, Validators.maxLength(20)]],
      description: ['', Validators.required],
      note_date: ['', Validators.required],
    });
    if (this.data?.item?.id) {
      this.patchForm();
    }
  }

  patchForm() {
    this.noteForm.patchValue({
      heading: this.data.item.heading,
      description: this.data.item.description,
      note_date: isoStringToDateObj(this.data.item.note_date),
    });
    this.noteForm.updateValueAndValidity();
  }

  submit() {
    if (this.noteForm.invalid) {
      Object.keys(this.noteForm.controls).forEach((key) => {
        const control = this.noteForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    } else {
      const form = this.noteForm.value;
      this.notesService
        .addUpdateNote(
          {
            heading: form.heading,
            description: form.description,
            note_date: dateToIsoString(form.note_date),
          },
          this.data?.item?.id || null
        )
        .subscribe({
          next: (response) => {
            this.sharedService.showToast({
              classname: 'success',
              text: response?.message,
            });
            this.closeModal();
          },
          error: (err) => {
            this.sharedService.showToast({
              classname: 'error',
              text: err?.error?.message,
            });
          },
        });
    }
  }

  closeModal(): void {
    this.activeModal.close(null);
  }
}
