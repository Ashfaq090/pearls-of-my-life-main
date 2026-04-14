import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NotesService } from '../../notes/notes.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PasswordService } from '../passwords.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-manage-password',
  templateUrl: './manage-password.component.html',
  styleUrls: ['./manage-password.component.scss'],
})
export class ManagePasswordComponent implements OnInit {
  public passwordForm: FormGroup;
  @Input() data: any = {};
  public showPassword: boolean = false;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly passwordService: PasswordService,
    private readonly sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.passwordForm = this.formBuilder.group({
      domain_name: ['', Validators.required],
      domain_url: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    if (this.data?.item?.id) {
      this.patchForm();
    }
  }

  patchForm() {
    this.passwordForm.patchValue({
      domain_name: this.data.item.domain_name,
      domain_url: this.data.item.domain_url,
      username: this.data.item.username,
      password: this.data.item.password,
    });
    this.passwordForm.updateValueAndValidity();
  }

  submit() {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach((key) => {
        const control = this.passwordForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
      return;
    } else {
      const form = this.passwordForm.value;
      this.passwordService
        .addUpdateCredentials(
          {
            domain_name: form.domain_name,
            domain_url: form.domain_url,
            username: form.username,
            password: form.password,
          },
          this.data?.item?.id || null
        )
        .subscribe({
          next: (response) => {
            this.sharedService.showToast({
              classname: 'success',
              text: response?.message,
            });
            this.closeModal(response.data);
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

  closeModal(creds?: any): void {
    this.activeModal.close(creds || null);
  }
}
