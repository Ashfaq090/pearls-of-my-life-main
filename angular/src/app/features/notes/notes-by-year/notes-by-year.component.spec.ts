import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotesByYearComponent } from './notes-by-year.component';

describe('NotesByYearComponent', () => {
  let component: NotesByYearComponent;
  let fixture: ComponentFixture<NotesByYearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotesByYearComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotesByYearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
