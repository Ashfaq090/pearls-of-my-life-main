import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyHolderDetailsComponent } from './key-holder-details.component';

describe('KeyHolderDetailsComponent', () => {
  let component: KeyHolderDetailsComponent;
  let fixture: ComponentFixture<KeyHolderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyHolderDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyHolderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
