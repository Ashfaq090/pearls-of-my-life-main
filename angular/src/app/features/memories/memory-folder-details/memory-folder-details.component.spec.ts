import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryFolderDetailsComponent } from './memory-folder-details.component';

describe('MemoryFolderDetailsComponent', () => {
  let component: MemoryFolderDetailsComponent;
  let fixture: ComponentFixture<MemoryFolderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemoryFolderDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemoryFolderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
