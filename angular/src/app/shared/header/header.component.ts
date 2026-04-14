import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from 'src/app/services/shared.service';
import { Router, RouterModule } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';
import { FileService } from 'src/app/services/file.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() activeItem: string;
  @Input() currentUserPlanName?: string | null = null;
  public imageUrl: SafeUrl | null = null;

  constructor(
    private readonly sharedService: SharedService,
    private readonly router: Router,
    private soundService: SoundService,
    private fileService: FileService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getProfilePic();
  }

  logout() {
    this.soundService.playClickSound();
    this.sharedService.logout();
  }

  openPersonalInfo() {
    this.soundService.playClickSound();
    this.router.navigate(['/personal-info']);
  }
  openPasswords() {
    this.router.navigate(['/passwords']);
  }

  openForgotPassword() {
    this.soundService.playClickSound();
    this.router.navigate(['/auth/forget-password']);
  }

  getProfilePic() {
    const path = 'personal-info/profile-pic';
    this.fileService.getFile(path).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: () => {
        this.imageUrl = null;
      },
    });
  }
}
