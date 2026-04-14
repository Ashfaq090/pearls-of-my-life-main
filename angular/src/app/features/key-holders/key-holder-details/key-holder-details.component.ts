import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeyHolderService } from '../key-holders.service';
import { SharedService } from 'src/app/services/shared.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { BE_URL } from 'src/app/constants/app.constant';
import { ManageKeyHoldersComponent } from '../manage-key-holders/manage-key-holders.component';

@Component({
  selector: 'app-key-holder-details',
  templateUrl: './key-holder-details.component.html',
  styleUrls: ['./key-holder-details.component.scss']
})
export class KeyHolderDetailsComponent implements OnInit {

  public keyHolder: any;
  public imageUrl: string = '';
  public isKeyHolder: boolean = this.sharedService.isKeyHolder();

  constructor(
    private readonly keyHolderService: KeyHolderService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly sharedService: SharedService,
    private readonly ngbModalService: NgbModal,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      if (params.get('id'))
        this.getKeyHolderById(params.get('id'));
    });
  }

  uploadFile(file: any) {

  }

  getKeyHolderById(id: any) {
    this.keyHolderService.getKeyHolderById(id).subscribe({
      next: (response) => {
        this.keyHolder = response;
        this.imageUrl = response?.image_path ? BE_URL + response?.image_path?.slice(1) : '';
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      }
    });
  }

  openKeyHolderDialog() {
    const modalRef = this.ngbModalService.open(ConfirmationModalComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    modalRef.componentInstance.data = {
      title: 'Delete Key Holder',
      text: 'Are you sure you want to delete this key Holder? This action is permanent and cannot be undone'
    }

    modalRef.result
      .then((result) => {
        this.deleteKeyHolder();
      })
      .catch((error) => console.log(error));
  }

  openEditDialog() {
    const modalRef = this.ngbModalService.open(ManageKeyHoldersComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    modalRef.componentInstance.data = {
      name: 'Edit',
      item: this.keyHolder,
    };

    modalRef.result
      .then(() => {
        if (this.keyHolder?.id) {
          this.getKeyHolderById(this.keyHolder.id);
        }
      })
      .catch(() => {});
  }

  deleteKeyHolder() {
    this.keyHolderService.deleteKeyHolder(this.keyHolder.id).subscribe({
      next: (response) => {
        this.sharedService.showToast({
          classname: 'success',
          text: response?.message,
        });
        this.router.navigate(['/key-holders']);
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/key-holders']);
  }

}
