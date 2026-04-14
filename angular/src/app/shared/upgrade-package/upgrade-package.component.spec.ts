import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpgradePackageComponent } from './upgrade-package.component';

describe('UpgradePackageComponent', () => {
  let component: UpgradePackageComponent;
  let fixture: ComponentFixture<UpgradePackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ UpgradePackageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpgradePackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
