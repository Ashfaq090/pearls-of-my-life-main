// src/app/pages/auto-obituary/auto-obituary.component.ts
import { Component, OnInit } from '@angular/core';
import { SoundService } from 'src/app/services/sound.service';
import { Router } from '@angular/router';

interface PersonName {
  first: string;
  middle: string;
  last: string;
}

interface Child {
  first: string;
  middle: string;
  last: string;
  relationship: string;
  isLiving: boolean;
}

interface Relative {
  first: string;
  middle: string;
  last: string;
  relationship: string;
}

@Component({
  selector: 'app-auto-obituary',
  templateUrl: './auto-obituary.component.html',
  styleUrls: ['./auto-obituary.component.scss'],
})
export class AutoObituaryComponent implements OnInit {
  form: any = {
    birthName: { first: '', middle: '', last: '' } as PersonName,
    marriedName: { first: '', middle: '', last: '' } as PersonName,
    currentName: { first: '', middle: '', last: '' } as PersonName,
    birthCity: '',
    birthState: '',
    mother: { first: '', middle: '', last: '' } as PersonName,
    father: { first: '', middle: '', last: '' } as PersonName,
    stepMother: { first: '', middle: '', last: '' } as PersonName,
    stepFather: { first: '', middle: '', last: '' } as PersonName,
    children: [] as Child[],
    siblings: [] as Relative[],
  };

  constructor(private soundService: SoundService, private router: Router) {}

  ngOnInit() {
    this.initScrollAnimation();
    // pre-populate one child/sibling entry so users see the fields immediately (optional)
    if (this.form.children.length === 0) {
      this.addChild();
    }
    if (this.form.siblings.length === 0) {
      this.addSibling();
    }
  }

  // simple intersection animation init (keeps behavior similar to earlier)
  private initScrollAnimation() {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('animate');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    setTimeout(() => {
      document.querySelectorAll('.content-section, .upgrade-section, .key-holder-card, .obituary-plan, .obituary-form')
        .forEach((el) => observer.observe(el));
    }, 120);
  }

  // dynamic children
  addChild() {
    this.form.children.push({
      first: '',
      middle: '',
      last: '',
      relationship: '',
      isLiving: true,
    } as Child);
  }

  removeChild(index: number) {
    this.form.children.splice(index, 1);
  }

  // dynamic siblings / relatives
  addSibling() {
    this.form.siblings.push({
      first: '',
      middle: '',
      last: '',
      relationship: '',
    } as Relative);
  }

  removeSibling(index: number) {
    this.form.siblings.splice(index, 1);
  }

  // preserve existing CTA logic: play sound + route if logged in else login
  scrollToTop() {
    this.soundService.playClickSound();
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  goToPage() {
    this.soundService.playClickSound();
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.router.navigate(['/subscription-plans']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  // form submit - you can replace with API save logic
  onSubmit(ev?: Event) {
    if (ev) {
      ev.preventDefault();
    }
    this.soundService.playClickSound();

    // basic local validation example (expand as needed)
    // e.g. ensure at least a birth first name or current name exists
    const hasName =
      !!this.form.birthName.first.trim() ||
      !!this.form.currentName.first.trim();

    if (!hasName) {
      // in real UI, show a toast or inline validation
      alert('Please provide at least a first name (birth or current).');
      return;
    }

    // TODO: call your service to persist the form (HTTP request)
    // Example: this.obituaryService.save(this.form).subscribe(...)

    console.log('Auto-Obituary form saved (local preview):', this.form);

    // proceed to next step or subscription guard
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
