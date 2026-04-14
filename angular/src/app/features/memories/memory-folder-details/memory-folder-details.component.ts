import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ADD_ITEMS_LIST,
  BE_URL,
  objectToQueryParams,
} from 'src/app/constants/app.constant';
import { ManageMemoriesComponent } from '../manage-memories/manage-memories.component';
import { ActivatedRoute } from '@angular/router';
import { MemoriesService } from '../memories.service';
import { HttpErrorResponse } from '@angular/common/http';
import { SharedService } from 'src/app/services/shared.service';
import { CarouselComponent } from 'src/app/shared/carousel/carousel.component';

@Component({
  selector: 'app-memory-folder-details',
  templateUrl: './memory-folder-details.component.html',
  styleUrls: ['./memory-folder-details.component.scss'],
})
export class MemoryFolderDetailsComponent implements OnInit {
  private baseUrl = BE_URL;

  public addCardItems: any = [ADD_ITEMS_LIST.MEMORIES];
  public folder_id: string = '';
  public folderDetails: any = [];
  folderResult = [
    {
      date: '2025-04-17T09:47:17.326Z',
      url: 'https://cloudinary-marketing-res.cloudinary.com/images/w_1000,c_scale/v1679921049/Image_URL_header/Image_URL_header-png?_i=AA?text=Slide+1',
    },
    {
      date: '2025-08-17T09:47:17.326Z',
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcTY50AnR35-aKaONIPoeLNh_KrvAq9bwD7A&s?text=Slide+2',
    },
    {
      date: '2025-04-30T09:47:17.326Z',
      url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTU3HFVnkYFJ_OIogo__Qv58bmhwRqZJcQhOA&s?text=Slide+3',
    },
  ];
  private pageOptions: any = {
    pageSize: 20,
    page: 1,
    pagination: false,
  };

  constructor(
    private readonly ngbModalService: NgbModal,
    private readonly activatedRoute: ActivatedRoute,
    private readonly memoriesService: MemoriesService,
    private readonly sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.folder_id = (params.get('id') || '').toString();
      if (this.folder_id) this.getFolderDetails();
    });
  }

  getFolderDetails() {
    const queryParams = objectToQueryParams({
      ...this.pageOptions,
      folder_id: this.folder_id,
    });
    this.memoriesService.getMemoriesFolderDetails(queryParams).subscribe({
      next: (response: any) => {
        this.folderDetails = response.data;
        this.folderDetails.forEach((item: any) => {
          item.image_details.image_path =
            this.baseUrl + item.image_details.image_path.slice(1);
        });
        // this.imageUrl = response?.image_path ? BE_URL + response?.image_path?.slice(1) : '';
      },
      error: (err: HttpErrorResponse) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }

  addMemories(event: any) {
    // Open the modal
    const modalRef = this.ngbModalService.open(ManageMemoriesComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    // Set the modal data
    modalRef.componentInstance.data = {
      name: 'Add',
      item: {
        folder_id: this.folder_id,
      },
    };

    // Handle the modal result
    modalRef.result
      .then((result) => {
        if (result) {
          this.getFolderDetails();
        }
      })
      .catch(() => {});
  }

  openCarosel() {
    // Open the modal
    const modalRef = this.ngbModalService.open(CarouselComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    let images: any[] = [];
    this.folderDetails.forEach((item: any) => {
      images.push({
        id: item?.id,
        url: item?.image_details?.image_path,
        date: item?.memory_date,
        description: item?.description,
      });
    });
    // Set the modal data
    modalRef.componentInstance.data = {
      heading: this.folderDetails[0]?.folder?.folder_name || 'Slider Images',
      images: images,
    };

    // Handle the modal result
    modalRef.result
      .then((result) => {
        this.getFolderDetails();
      })
      .catch((error) => console.log(error));
  }
}
