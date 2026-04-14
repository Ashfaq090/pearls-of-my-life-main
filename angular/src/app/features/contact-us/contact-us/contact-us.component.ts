import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';

interface ContactForm {
  name: string;
  company: string;
  email: string;
  subject: string;
  message: string;
}

@Component({
  selector: 'app-contact-us',
  // standalone: true,
  // imports: [CommonModule, FormsModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
})
export class ContactUsComponent implements OnInit {
  constructor(private soundService: SoundService, private router: Router) {}
  scrollToTop(type: string) {
    this.soundService.playClickSound();
    const token = localStorage.getItem('accessToken');
    if (token && type === 'dashboard') {
      this.router.navigate(['/dashboard']);
    } else if (type === 'signup' && !token) {
      this.router.navigate(['/auth/register']);
    } else {
      this.router.navigate(['/auth/login']);
      // this.router.navigate(['/auth/register']);
      // window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  contactForm: ContactForm = {
    name: '',
    company: '',
    email: '',
    subject: '',
    message: '',
  };

  ngOnInit() {
    this.initScrollAnimation();
  }

  onSubmit() {
    console.log('Form submitted:', this.contactForm);
    this.soundService.playClickSound(); // Here you would typically send the form to your backend
    alert('Thank you for your message! We will get back to you soon.');
    this.resetForm();
  }

  private resetForm() {
    this.contactForm = {
      name: '',
      company: '',
      email: '',
      subject: '',
      message: '',
    };
  }

  private initScrollAnimation() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    setTimeout(() => {
      document
        .querySelectorAll('.contact-section, .cta-section')
        .forEach((section) => observer.observe(section));
    }, 100);
  }
}
