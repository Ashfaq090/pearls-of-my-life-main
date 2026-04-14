import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterKeyholderComponent } from './register-keyholder.component';

describe('RegisterKeyholderComponent', () => {
  let component: RegisterKeyholderComponent;
  let fixture: ComponentFixture<RegisterKeyholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterKeyholderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterKeyholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
