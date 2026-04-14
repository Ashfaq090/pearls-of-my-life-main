import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeyHoldersComponent } from './key-holders.component';

describe('KeyHoldersComponent', () => {
  let component: KeyHoldersComponent;
  let fixture: ComponentFixture<KeyHoldersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeyHoldersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeyHoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
