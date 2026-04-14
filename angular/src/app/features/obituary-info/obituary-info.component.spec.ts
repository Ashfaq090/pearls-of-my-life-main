import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObituaryInfoComponent } from './obituary-info.component';

describe('ObituaryInfoComponent', () => {
  let component: ObituaryInfoComponent;
  let fixture: ComponentFixture<ObituaryInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObituaryInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObituaryInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
