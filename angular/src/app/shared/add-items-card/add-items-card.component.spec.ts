import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddItemsCardComponent } from './add-items-card.component';

describe('AddItemsCardComponent', () => {
  let component: AddItemsCardComponent;
  let fixture: ComponentFixture<AddItemsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddItemsCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddItemsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
