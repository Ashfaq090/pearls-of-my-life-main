// src/app/components/hero/hero.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { titleAnimation } from 'src/app/services/animations';
// import { titleAnimation } from '../../services/animations';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  animations: [titleAnimation],
  imports: [CommonModule],
})
export class HeroComponent implements OnInit {
  @Input() title: string = '';
  @Input() bgImage: string = 'assets/hero_bg_pol.jpg';
  @Input() subtitle: string = '';

  ngOnInit() {
    // Default background if none provided
    if (!this.bgImage) {
      this.bgImage = 'assets/hero_bg_pol.jpg';
    }
  }
}
