// sound.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  private clickSound = new Audio();

  playClickSound() {
    this.clickSound.currentTime = 0; // Rewind to start
    this.clickSound.play();
  }
}
