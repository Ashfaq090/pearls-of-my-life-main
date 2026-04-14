import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { objectToQueryParams } from 'src/app/constants/app.constant';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import { SharedService } from 'src/app/services/shared.service';
import { ManageObituaryComponent } from '../manage-obituary/manage-obituary.component';
import { ObituaryInfoService } from '../obituary-info.service';
import { SoundService } from 'src/app/services/sound.service';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-obituary-by-year',
  templateUrl: './obituary-by-year.component.html',
  styleUrls: ['./obituary-by-year.component.scss'],
})
export class ObituaryByYearComponent implements OnInit, OnDestroy {
  public obituaryList: any[] = [];
  public obituaryListByMonths: any[] = [];
  public year: any;
  private pageOptions: any = {
    pageSize: 20,
    page: 1,
    pagination: true,
  };
  private scrollListener: any;
  private readonly obituaryModalOptions: NgbModalOptions = {
    size: 'lg',
    backdrop: 'static',
    keyboard: false,
    centered: false,
  };

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly obituaryInfoService: ObituaryInfoService,
    private readonly ngbModalService: NgbModal,
    private readonly sharedService: SharedService,
    private readonly soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.year = params.get('year');
      this.getObituariesByYear();
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
      this.getObituariesByYear();
    }
  }

  getObituariesByYear() {
    this.soundService.playClickSound();
    this.pageOptions['year'] = this.year;
    const queryParams = objectToQueryParams(this.pageOptions);
    this.obituaryInfoService.getObituaryInfo(queryParams).subscribe({
      next: (response: any) => {
        if (response?.data && response?.data?.length) {
          this.obituaryList = [];
          this.obituaryList.push(...response.data);
          this.arrangeListByMonths();
        } else {
          this.removeScrollListener();
        }
      },
      error: (err: any) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }

  arrangeListByMonths() {
    this.obituaryListByMonths = [];
    let i = 12;
    while (i > 0) {
      const list = this.obituaryList.filter(
        (x) => i == new Date(x.birth_date).getMonth() + 1
      );
      if (list.length) {
        this.obituaryListByMonths.push(list);
      }
      i--;
    }
  }

  openObituaryPopup(item: any) {
    const modalRef = this.ngbModalService.open(
      ManageObituaryComponent,
      this.obituaryModalOptions
    );

    modalRef.componentInstance.data = {
      name: item?.id ? 'Edit' : 'Add',
      item: item?.id ? item : null,
    };

    modalRef.result
      .then((result) => {
        this.getObituariesByYear();
      })
      .catch((error) => console.log(error));
  }

  openDeleteDialog(obituary: any) {
    const modalRef = this.ngbModalService.open(ConfirmationModalComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    modalRef.componentInstance.data = {
      title: 'Delete Obituary',
      text: 'Are you sure you want to delete this obituary? This action is permanent and cannot be undone',
    };

    modalRef.result
      .then((result) => {
        this.deleteObituary(obituary.id);
      })
      .catch((error) => console.log(obituary));
  }

  deleteObituary(obituaryId: string) {
    this.obituaryInfoService.deleteObituaryInfo(obituaryId).subscribe({
      next: (response: any) => {
        this.sharedService.showToast({
          classname: 'success',
          text: response?.message,
        });
        this.getObituariesByYear();
      },
      error: (err: any) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }
}
