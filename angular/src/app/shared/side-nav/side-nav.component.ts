import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideNavComponent implements OnChanges {
  @Input() navList: any;
  @Input() activeItem: string;
  public activeNav: any;

  constructor(
    // private readonly _dataService: DataService
    private readonly router: Router,
    private soundService: SoundService
  ) {
    console.log('SideNavComponent initialized');
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Navigation list:', this.navList);
    console.log('Active item:', this.activeItem);
    // this.soundService.playClickSound();
    if (
      this.activeItem &&
      !this.navList?.find((x: any) => x.name == this.activeItem)
    ) {
      if (this.router.url === '/' || this.router.url === '') {
        this.router.navigate([`${this.navList[0]?.link}`]);
      }
    }
  }
}
