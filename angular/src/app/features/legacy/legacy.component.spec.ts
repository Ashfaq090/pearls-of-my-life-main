// src/app/pages/legacy/legacy.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { LegacyComponent } from './legacy.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

describe('LegacyComponent', () => {
  let component: LegacyComponent;
  let fixture: ComponentFixture<LegacyComponent>;
  let ngbModal: jasmine.SpyObj<NgbModal>;

  beforeEach(async () => {
    ngbModal = jasmine.createSpyObj<NgbModal>('NgbModal', ['open']);

    await TestBed.configureTestingModule({
      imports: [LegacyComponent],
      providers: [{ provide: NgbModal, useValue: ngbModal }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open welcome modal once when flag is missing and set flag on close', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    const setItemSpy = spyOn(localStorage, 'setItem');

    const modalRef = { result: Promise.resolve(true) } as any;
    ngbModal.open.and.returnValue(modalRef);

    component.ngAfterViewInit();
    tick(0);
    flushMicrotasks();

    expect(ngbModal.open).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenCalled();
  }));

  it('should not open welcome modal when flag is already present', fakeAsync(() => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'accessToken') return null;
      if (key && key.startsWith('welcomeModalShown:')) return '1';
      return null;
    });
    spyOn(localStorage, 'setItem');

    component.ngAfterViewInit();
    tick(0);

    expect(ngbModal.open).not.toHaveBeenCalled();
  }));
});
