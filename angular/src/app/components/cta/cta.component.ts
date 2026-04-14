// src/app/components/cta/cta.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { fadeInOnScroll } from '../../services/animations';


@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta.component.html',
  styleUrls: ['./cta.component.scss'],
  animations: [
    fadeInOnScroll
  ]
})
export class CtaComponent {
  @Input() title: string = 'Ready to Get Started?';
  @Input() subtitle: string = '';
  @Input() bgClass: string = 'bg-blue';
}