import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditableHeadingComponent } from './editable-heading.component';

describe('EditableHeadingComponent', () => {
  let component: EditableHeadingComponent;
  let fixture: ComponentFixture<EditableHeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditableHeadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditableHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
