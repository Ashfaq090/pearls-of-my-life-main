// src/app/services/animations.ts
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
} from '@angular/animations';

export const fadeInOnScroll = trigger('fadeInOnScroll', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(40px)' }),
    animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const titleAnimation = trigger('titleAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-100px)' }),
    animate('0.7s ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
  ]),
]);

export const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({
          position: 'absolute',
          width: '100%',
          opacity: 0,
          transform: 'translateX(100%)',
        }),
        animate(
          '0.5s ease-in-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [
        style({ position: 'absolute', width: '100%' }),
        animate(
          '0.5s ease-in-out',
          style({ opacity: 0, transform: 'translateX(-100%)' })
        ),
      ],
      { optional: true }
    ),
  ]),
]);
