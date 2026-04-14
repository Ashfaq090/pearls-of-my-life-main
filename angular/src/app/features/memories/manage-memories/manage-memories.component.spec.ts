import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMemoriesComponent } from './manage-memories.component';

describe('ManageMemoriesComponent', () => {
  let component: ManageMemoriesComponent;
  let fixture: ComponentFixture<ManageMemoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageMemoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageMemoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
