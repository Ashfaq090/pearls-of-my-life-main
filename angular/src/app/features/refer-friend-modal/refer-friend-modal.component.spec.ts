import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferFriendModalComponent } from './refer-friend-modal.component';

describe('ReferFriendModalComponent', () => {
  let component: ReferFriendModalComponent;
  let fixture: ComponentFixture<ReferFriendModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferFriendModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferFriendModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
