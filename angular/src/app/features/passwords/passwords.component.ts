import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ADD_ITEMS_LIST } from 'src/app/constants/app.constant';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { PasswordService } from './passwords.service';
import { ManagePasswordComponent } from './manage-password/manage-password.component';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-passwords',
  templateUrl: './passwords.component.html',
  styleUrls: ['./passwords.component.scss']
})
export class PasswordsComponent implements OnInit {
  constructor(
    private readonly ngbModalService: NgbModal,
    private readonly passwordService: PasswordService,
    private readonly sharedService: SharedService
  ){}

  public addCardItems: any = [
    ADD_ITEMS_LIST.PASSWORDS
  ]

  public credentials: any[] = [];
  public credentailDetails: any = undefined;
  public isPasswordVisible: boolean = false;

  ngOnInit(): void {
    this.getCredentials();
  }

  getCredentials(): void{
    this.passwordService.getCredentials({pagination: false}).subscribe({
      next: (respoonse) => {
        this.credentials = respoonse.data;
        // if(respoonse?.data && respoonse?.data?.length){
        //   this.credentailDetails = respoonse.data[0];
        // }
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      }
    });
  }

  showDetails(details: any): void {
    this.credentailDetails = details;
    this.isPasswordVisible = false;
  }

  copyPassword(password: string){
    navigator.clipboard.writeText(password)
    .then(() => {
      this.sharedService.showToast({
        classname: 'success',
        text: 'Copied to clipboard',
      });
    })
  }

  openPasswordDialog(item: any) {
    const modalRef = this.ngbModalService.open(ManagePasswordComponent, {
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

    modalRef.result
      .then((result) => {
        if(result){
          this.credentailDetails = result;
        }
        this.getCredentials();
      })
      .catch((error) => console.log(item));

  }

  openDeleteDialog(id: any) {
    const modalRef = this.ngbModalService.open(ConfirmationModalComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    modalRef.componentInstance.data = {
      title: 'Delete Password',
      text: 'Are you sure you want to delete this password? This action is permanent and cannot be undone'
    }

    modalRef.result
      .then((result) => {
        this.deleteCredential(id);
      })
      .catch((error) => console.log(id));
  }

  deleteCredential(note_id: string){
    this.passwordService.deleteCredentials(note_id).subscribe({
      next: (response) => {
        this.sharedService.showToast({
          classname: 'success',
          text: response?.message,
        });
        this.getCredentials();
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
