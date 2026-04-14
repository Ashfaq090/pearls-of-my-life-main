import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ADD_ITEMS_LIST } from 'src/app/constants/app.constant';
import { ManageNotesComponent } from '../notes/manage-notes/manage-notes.component';
import { ManagePasswordComponent } from '../passwords/manage-password/manage-password.component';
import { ManageMemoriesComponent } from '../memories/manage-memories/manage-memories.component';
import { SubscriptionGuard } from 'src/app/guards/subscription.guard';
import { SharedService } from 'src/app/services/shared.service';
import { SoundService } from 'src/app/services/sound.service';
import { KeyHolderService } from '../../services/key-holder.service';
import { ReferFriendModalComponent } from '../refer-friend-modal/refer-friend-modal.component';
import { PaymentService } from 'src/app/services/payment.service';
import { WelcomeModalComponent } from 'src/app/shared/confirmation-modal/welcome-modal.component';
import { AutoObituaryModalComponent } from '../key-holders/auto-obituary-modal/auto-obituary-modal.component';
import { ObituaryInfoService } from '../obituary-info/obituary-info.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  hasKeyHolders: boolean = false;
  obituaryInfo: boolean = false;

  constructor(
    private readonly ngbModalService: NgbModal,
    private sharedService: SharedService,
    private subscriptionGuard: SubscriptionGuard,
    private soundService: SoundService,
    private router: Router,
    private keyHolderService: KeyHolderService,
        private readonly obituaryInfoService: ObituaryInfoService,
    private paymentService: PaymentService
  ) {}

  public addCardItems: any = [
    ADD_ITEMS_LIST.MEMORIES,
    ADD_ITEMS_LIST.NOTES,
    // ADD_ITEMS_LIST.ASSETS,
    ADD_ITEMS_LIST.LEGACY,
  ];

  subscriptionPlan: any = null;

  ngOnInit() {
    this.checkKeyHolders();
    this.loadSubscriptionPlan();
  }

  checkKeyHolders() {
    this.keyHolderService.getKeyHolders().subscribe({
      next: (response: any) => {
        const count = response?.data?.length || 0;
        this.hasKeyHolders = count > 0;
        if (count === 0) {
          this.openWelcomeModal();
        }else{
          this.checkObituaryInfo();
        }
      },
      error: () => {
        this.hasKeyHolders = false;
      },
    });
  }

  checkObituaryInfo() {
    this.obituaryInfoService.getObituaryInfo().subscribe({
      next: (response: any) => {
        const createdOn = response?.data[0]?.created_on || null;
        this.obituaryInfo = createdOn ? true : false;
        if (!createdOn) {
          this.openAutoObituaryModal();
        }
      },
      error: () => {
        this.obituaryInfo = false;
      },
    });
  }

  loadSubscriptionPlan() {
    this.paymentService.getCurrentSubscription().subscribe({
      next: (subscription: any) => {
        if (subscription && subscription.plan) {
          this.subscriptionPlan = subscription.plan;
          this.updateCardItems();
        }
      },
      error: () => {
        this.subscriptionPlan = null;
        this.updateCardItems();
      },
    });
  }

  updateCardItems() {
    const items = [ADD_ITEMS_LIST.MEMORIES, ADD_ITEMS_LIST.NOTES];

    // Add Videos if allowed
    if (this.subscriptionPlan?.videoRecordingAllowed) {
      items.push(ADD_ITEMS_LIST.VIDEOS);
    }

    // Add Audios if allowed
    if (this.subscriptionPlan?.audioRecordingAllowed) {
      items.push(ADD_ITEMS_LIST.AUDIOS);
    }

    items.push(ADD_ITEMS_LIST.LEGACY);
    console.log('Updated Card Items:', items);
    this.addCardItems = items;
  }

  private openWelcomeModal(): void {
    const modalRef = this.ngbModalService.open(WelcomeModalComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    modalRef.result.then(() => {}).catch(() => {});
  }

  private openAutoObituaryModal(): void {
    const modalRef = this.ngbModalService.open(AutoObituaryModalComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: true,
    });
    modalRef.result.then(() => {}).catch(() => {});
  }

  public addComponent(event: any) {
    console.log(event);
    if (!this.hasKeyHolders) {
      this.sharedService.showToast({
        classname: 'warning',
        text: 'Please assign at least one key holder to access this feature.',
      });
      this.router.navigate(['/key-holders']);
      return;
    }

    switch (event.component) {
      case ADD_ITEMS_LIST.NOTES.label:
        this.addNote();
        break;
      case ADD_ITEMS_LIST.PASSWORDS.label:
        this.addPassword();
        break;
      case ADD_ITEMS_LIST.MEMORIES.label:
        this.addMemories();
        break;
      case ADD_ITEMS_LIST.VIDEOS.label:
        this.router.navigate(['/videos-map']);
        break;
      case ADD_ITEMS_LIST.AUDIOS.label:
        this.router.navigate(['/audios']);
        break;
      case ADD_ITEMS_LIST.LEGACY.label:
        this.referFriend();
        break;
      default:
        return;
    }
  }

  // Removed canActivate method - using async check in addNote and addMemories instead
  referFriend() {
    console.log('Refer a Friend clicked');
    this.soundService.playClickSound();
    const modalRef = this.ngbModalService.open(ReferFriendModalComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    // Set the modal data
    modalRef.componentInstance.data = {
      name: 'Add',
      item: null,
    };

    // Handle the modal result
    modalRef.result
      .then((result) => {
        console.log(result);
      })
      .catch((error) => console.log(error));
  }
  addPassword() {
    // Open the modal
    this.soundService.playClickSound();

    const modalRef = this.ngbModalService.open(ManagePasswordComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });

    // Set the modal data
    modalRef.componentInstance.data = {
      name: 'Add',
      item: null,
    };

    // Handle the modal result
    modalRef.result
      .then((result) => {
        console.log(result);
      })
      .catch((error) => console.log(error));
  }

  addNote() {
    // Open the modal
    this.soundService.playClickSound();

    // Check subscription asynchronously
    this.paymentService.getCurrentSubscription().subscribe({
      next: (subscription: any) => {
        if (
          subscription &&
          subscription.status === 'active' &&
          subscription.plan
        ) {
          const modalRef = this.ngbModalService.open(ManageNotesComponent, {
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            centered: false,
          });

          // Set the modal data
          modalRef.componentInstance.data = {
            name: 'Add',
            item: null,
          };

          // Handle the modal result
          modalRef.result
            .then((result) => {
              console.log(result);
            })
            .catch((error) => console.log(error));
        } else {
          this.sharedService.showToast({
            classname: 'warning',
            text: 'Please subscribe to a plan to access this feature.',
          });
          this.router.navigate(['/subscription-plans']);
        }
      },
      error: () => {
        this.sharedService.showToast({
          classname: 'warning',
          text: 'Please subscribe to a plan to access this feature.',
        });
        this.router.navigate(['/subscription-plans']);
      },
    });
  }

  addMemories() {
    this.soundService.playClickSound(); // Play sound on add memories button click

    // Check subscription asynchronously
    this.paymentService.getCurrentSubscription().subscribe({
      next: (subscription: any) => {
        if (
          subscription &&
          subscription.status === 'active' &&
          subscription.plan
        ) {
          const modalRef = this.ngbModalService.open(ManageMemoriesComponent, {
            size: 'md',
            backdrop: 'static',
            keyboard: false,
            centered: false,
          });

          // Set the modal data
          modalRef.componentInstance.data = {
            name: 'Add',
            item: null,
          };

          // Handle the modal result
          modalRef.result
            .then((result) => {
              console.log(result);
            })
            .catch((error) => console.log(error));
        } else {
          this.sharedService.showToast({
            classname: 'warning',
            text: 'Please subscribe to a plan to access this feature.',
          });
          this.router.navigate(['/subscription-plans']);
        }
      },
      error: () => {
        this.sharedService.showToast({
          classname: 'warning',
          text: 'Please subscribe to a plan to access this feature.',
        });
        this.router.navigate(['/subscription-plans']);
      },
    });
  }
}
