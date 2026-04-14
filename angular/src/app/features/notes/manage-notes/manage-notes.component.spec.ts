import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageNotesComponent } from './manage-notes.component';

describe('ManageNotesComponent', () => {
  let component: ManageNotesComponent;
  let fixture: ComponentFixture<ManageNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageNotesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
