// src/app/pages/auto-obituary/auto-obituary.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoObituaryComponent } from './auto-obituary.component';

describe('AutoObituaryComponent', () => {
  let component: AutoObituaryComponent;
  let fixture: ComponentFixture<AutoObituaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutoObituaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoObituaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});