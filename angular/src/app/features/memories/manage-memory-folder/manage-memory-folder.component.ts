import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { MemoriesService } from '../memories.service';
import { SharedService } from 'src/app/services/shared.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-manage-memory-folder',
  templateUrl: './manage-memory-folder.component.html',
  styleUrls: ['./manage-memory-folder.component.scss']
})
export class ManageMemoryFolderComponent implements OnInit {

  public addFolderForm: FormGroup;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly memoriesService: MemoriesService,
    private readonly sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.addFolderForm = this.formBuilder.group({
      folder_name: ['', [Validators.required, Validators.maxLength(25)]]
    });
  }

  submit() {
    if (this.addFolderForm.invalid) {
      console.log('Form invalid');
      return;
    } else {
      const form = this.addFolderForm.value;
      this.memoriesService.addUpdateMemoryFolders(form).subscribe({
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
        }
      });
    }
  }

  closeModal(): void {
    this.activeModal.close(null);
  }

}
