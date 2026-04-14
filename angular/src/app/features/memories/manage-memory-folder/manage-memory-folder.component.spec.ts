import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageMemoryFolderComponent } from './manage-memory-folder.component';

describe('ManageMemoryFolderComponent', () => {
  let component: ManageMemoryFolderComponent;
  let fixture: ComponentFixture<ManageMemoryFolderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageMemoryFolderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageMemoryFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
