import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageKeyHoldersComponent } from './manage-key-holders.component';

describe('ManageKeyHoldersComponent', () => {
  let component: ManageKeyHoldersComponent;
  let fixture: ComponentFixture<ManageKeyHoldersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageKeyHoldersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageKeyHoldersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
