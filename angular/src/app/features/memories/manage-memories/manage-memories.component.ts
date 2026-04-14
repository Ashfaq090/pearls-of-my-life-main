import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  NgbActiveModal,
  NgbDatepickerModule,
  NgbDateParserFormatter,
} from '@ng-bootstrap/ng-bootstrap';
import {
  dateToIsoString,
  isoStringToDateObj,
  RELATION_LIST,
} from 'src/app/constants/app.constant';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from 'src/app/services/shared.service';
import { MemoriesService } from '../memories.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CustomDateParserFormatter } from 'src/app/shared/services/custom-date-parser-formatter.service';

@Component({
  selector: 'app-manage-memories',
  templateUrl: './manage-memories.component.html',
  styleUrls: ['./manage-memories.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }],
})
export class ManageMemoriesComponent implements OnInit {
  public memoriesForm: FormGroup;
  @Input() data: any = {};
  public imageUrl: any;
  public uploadedFile: any;
  public relationList = RELATION_LIST;
  public memoryFolders: any[] = [];

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly memoriesService: MemoriesService,
    private readonly sharedService: SharedService,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getMemoriesFolderList();

    this.memoriesForm = this.formBuilder.group({
      file: ['', Validators.required],
      folder_id: [
        {
          value: this.data?.item?.folder_id || '',
          disabled: this.data?.item?.folder_id,
        },
        Validators.required,
      ],
      date: ['', Validators.required],
      description: ['', Validators.required],
    });
    if (this.data?.item?.id) {
      this.patchForm(this.data?.item);
    }
  }

  getMemoriesFolderList() {
    this.memoriesService.getMemoriesFolders().subscribe({
      next: (res: any) => {
        this.memoryFolders = res.data;
      },
      error: (err: HttpErrorResponse) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }

  patchForm(item: any) {
    this.memoriesForm.patchValue({
      folder_id: item.folder_id ?? this.data?.item.folder_id,
      description: item?.description ?? '',
      date: item.date ? isoStringToDateObj(item.date) : null,
    });
    this.memoriesForm.updateValueAndValidity();
  }

  submit() {
    if (this.memoriesForm.invalid) {
      Object.keys(this.memoriesForm.controls).forEach((key) => {
        const control = this.memoriesForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    } else {
      const form = this.memoriesForm.value;
      const file = this.uploadedFile ? this.uploadedFile : null;
      this.memoriesService
        .addMemories(file, {
          folder_id: this.data?.item?.folder_id || form.folder_id,
          description: form.description,
          date: form.date ? dateToIsoString(form.date) : null,
        })
        .subscribe({
          next: (response: any) => {
            this.sharedService.showToast({
              classname: 'success',
              text: response?.message,
            });
            this.activeModal.close(response);
          },
          error: (err: HttpErrorResponse) => {
            this.sharedService.showToast({
              classname: 'error',
              text: err?.error?.message,
            });
          },
        });
    }
  }

  closeModal(): void {
    this.activeModal.dismiss('cancel');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onFileChange(file: any) {
    this.uploadedFile = file[0];
    const fileType = file[0].type;
    
    // Handle different file types for preview
    if (fileType.startsWith('image/')) {
      const objectURL = URL.createObjectURL(file[0]);
      this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    } else if (fileType.startsWith('video/')) {
      const objectURL = URL.createObjectURL(file[0]);
      this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
    } else {
      // For other file types (audio, docs, etc.), show a placeholder
      this.imageUrl = null;
    }
  }
}
