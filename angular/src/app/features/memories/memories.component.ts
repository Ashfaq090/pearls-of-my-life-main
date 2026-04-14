import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MemoriesService } from './memories.service';
import { SharedService } from 'src/app/services/shared.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ADD_ITEMS_LIST } from 'src/app/constants/app.constant';
import { ManageNotesComponent } from '../notes/manage-notes/manage-notes.component';
import { ManageMemoryFolderComponent } from './manage-memory-folder/manage-memory-folder.component';

@Component({
  selector: 'app-memories',
  templateUrl: './memories.component.html',
  styleUrls: ['./memories.component.scss']
})
export class MemoriesComponent implements OnInit {

  public memoryFolders: any[] = [];
  public isKeyHolder: boolean = this.sharedService.isKeyHolder();

  public addCardItems: any = [
    ADD_ITEMS_LIST.MEMORIES
  ];

  constructor(
    private readonly memoriesService: MemoriesService,
    private readonly ngbModalService: NgbModal,
    private readonly sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.getMemoriesFolderList();
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
      }
    });
  }

  openMemoryFolderPopup() {
    // Open the modal
    const modalRef = this.ngbModalService.open(ManageMemoryFolderComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    // Handle the modal result
    modalRef.result
      .then((result) => {
        this.getMemoriesFolderList();
      })
      .catch((error) => console.log(error));
  }

  renameFolder(name: any) {
    if (this.memoryFolders.find((x: any) => x.folder_name == name)) {
      this.sharedService.showToast({
        classname: 'error',
        text: 'Folder name already exists'
      })
    }
    else
      console.log(name);
  }

}
