import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/services/shared.service';
import { KeyHolderService } from './key-holders.service';
import { ManageKeyHoldersComponent } from './manage-key-holders/manage-key-holders.component';
import { AutoObituaryModalComponent } from './auto-obituary-modal/auto-obituary-modal.component';
import { BE_URL } from 'src/app/constants/app.constant';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-key-holders',
  templateUrl: './key-holders.component.html',
  styleUrls: ['./key-holders.component.scss'],
})
export class KeyHoldersComponent implements OnInit {
  public personKeyholders: any[] = [];
  public funeralHome: any | null = null;
  public isKeyHolder: boolean = this.sharedService.isKeyHolder();
  public readonly MAX_KEYHOLDERS = 3;
  private autoOpenedAddModal = false;
  private readonly FUNERAL_HOME_TYPE = 'FUNERAL_HOME';

  constructor(
    private readonly keyHolderService: KeyHolderService,
    private readonly ngbModalService: NgbModal,
    private readonly sharedService: SharedService,
    private soundService: SoundService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  // public addCardItems: any = [
  //   ADD_ITEMS_LIST.KEY_HOLDERS
  // ]

  ngOnInit(): void {
    this.getKeyHolders();
  }

  getKeyHolders() {
    this.keyHolderService.getKeyHolders().subscribe({
      next: (response) => {
        const items = response?.data || [];
        const normalized = items.map((item: any) => {
          return {
            ...item,
            type: String(item?.type || 'PERSON').toUpperCase(),
            image_path: item?.image_path
              ? BE_URL + item?.image_path?.slice(1)
              : null,
          };
        });
        this.personKeyholders = normalized.filter(
          (item: any) => item.type !== this.FUNERAL_HOME_TYPE
        );
        this.funeralHome =
          normalized.find(
            (item: any) => item.type === this.FUNERAL_HOME_TYPE
          ) || null;
        this.maybeAutoOpenAddModal();
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }

  openKeyHolderPopup(item: any) {
    this.soundService.playClickSound();
    const isEdit = !!item?.id;
    if (!isEdit && this.personKeyholders.length >= this.MAX_KEYHOLDERS) {
      this.sharedService.showToast({
        classname: 'warning',
        text: 'You can only add up to 3 key holders.',
      });
      return;
    }
    // Open the modal
    const modalRef = this.ngbModalService.open(ManageKeyHoldersComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    // Set the modal data
    modalRef.componentInstance.data = {
      name: isEdit ? 'Edit' : 'Add',
      type: 'PERSON',
      ordinalLabel: isEdit
        ? null
        : this.getOrdinalLabel(this.personKeyholders.length + 1),
      item: isEdit ? item : null,
    };

    // Handle the modal result
    modalRef.result
      .then((result) => {
        this.getKeyHolders();
        if (result?.saved === true) {
          this.ngbModalService.open(AutoObituaryModalComponent, {
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            centered: true,
          });
        }
      })
      .catch((error) => console.log(error));
  }

  private maybeAutoOpenAddModal(): void {
    if (this.autoOpenedAddModal) return;
    if (this.personKeyholders.length !== 0) return;
    const openAdd = this.route.snapshot.queryParamMap.get('openAdd') === '1';
    if (!openAdd) return;
    this.autoOpenedAddModal = true;
    this.openKeyHolderPopup(null);
  }

  private getOrdinalLabel(value: number): string {
    if (value === 1) return '1st';
    if (value === 2) return '2nd';
    if (value === 3) return '3rd';
    return `${value}th`;
  }

  goToObituaryInfo(): void {
    this.router.navigate(['/obituary-info'], { queryParams: { openAdd: '1' } });
  }

  openFuneralHomePopup(): void {
    this.soundService.playClickSound();
    const isEdit = !!this.funeralHome?.id;
    const modalRef = this.ngbModalService.open(ManageKeyHoldersComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    modalRef.componentInstance.data = {
      name: isEdit ? 'Edit' : 'Add',
      type: this.FUNERAL_HOME_TYPE,
      item: isEdit ? this.funeralHome : null,
    };

    modalRef.result
      .then(() => {
        this.getKeyHolders();
      })
      .catch((error) => console.log(error));
  }
}
