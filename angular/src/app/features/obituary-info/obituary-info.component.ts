import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ObituaryInfoService } from './obituary-info.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedService } from 'src/app/services/shared.service';
import { ManageObituaryComponent } from './manage-obituary/manage-obituary.component';
import { ConfirmationModalComponent } from 'src/app/shared/confirmation-modal/confirmation-modal.component';
import {
  ADD_ITEMS_LIST,
  objectToQueryParams,
} from 'src/app/constants/app.constant';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FeaturesService } from '../features.service';

@Component({
  selector: 'app-obituary-info',
  templateUrl: './obituary-info.component.html',
  styleUrls: ['./obituary-info.component.scss'],
})
export class ObituaryInfoComponent implements OnInit {
  obituaryForm: FormGroup;
  obituaryInfo: any;
  isEditMode = false;

  private pageOptions: any = {
    pageSize: 20,
    page: 1,
    pagination: false,
  };
  public addCardItems: any = [ADD_ITEMS_LIST.OBITUARY];

  public obituaries: any[] = [];
  public obituariesListByYear: any[] = [];
  public hasObituary = false;
  public latestObituary: any = null;
  public isKeyHolder: boolean = false;
  public planName: string | null = null;
  private autoOpenedManageModal = false;
  private readonly obituaryModalOptions: NgbModalOptions = {
    size: 'lg',
    backdrop: 'static',
    keyboard: false,
    centered: false,
  };

  get showPremiumFields(): boolean {
    return this.planName === 'Legacy Creation Plan';
  }

  constructor(
    private fb: FormBuilder,
    private obituaryInfoService: ObituaryInfoService,
    private modalService: NgbModal,
    private sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute,
    private featuresService: FeaturesService
  ) {
    this.initForm();
    this.isKeyHolder = this.sharedService.isKeyHolder();
  }

  ngOnInit(): void {
    this.loadObituaryInfo();
    this.getObituaries();
    this.maybeAutoOpenManageModal();
    this.loadUserPlan();
  }

  private initForm(): void {
    this.obituaryForm = this.fb.group({
      full_name: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      date_of_death: [''],
      place_of_birth: ['', Validators.required],
      place_of_death: [''],
      biography: [''],
      father_name: [''],
      mother_name: [''],
      spouse_name: [''],
      children: this.fb.array([]),
      siblings: this.fb.array([]),
    });
  }

  /** Load single obituary info (used for edit form) */
  loadObituaryInfo(): void {
    this.obituaryInfoService.getObituaryInfo().subscribe({
      next: (response) => {
        if (response?.data) {
          this.obituaryInfo = response.data;
          this.patchFormValues();
        }
      },
      error: (error) => {
        this.sharedService.showToast({
          classname: 'error',
          text: error?.error?.message,
        });
      },
    });
  }

  /** Populate form with fetched obituaryInfo */
  private patchFormValues(): void {
    if (!this.obituaryInfo) return;
    this.obituaryForm.patchValue({
      full_name: this.obituaryInfo.full_name,
      date_of_birth: this.obituaryInfo.date_of_birth,
      date_of_death: this.obituaryInfo.date_of_death,
      place_of_birth: this.obituaryInfo.place_of_birth,
      place_of_death: this.obituaryInfo.place_of_death,
      biography: this.obituaryInfo.biography,
      father_name: this.obituaryInfo.father_name,
      mother_name: this.obituaryInfo.mother_name,
      spouse_name: this.obituaryInfo.spouse_name,
    });
    (this.obituaryForm.get('children') as FormArray).clear();
    (this.obituaryForm.get('siblings') as FormArray).clear();
    this.obituaryInfo.children?.forEach((c: any) => this.addChild(c));
    this.obituaryInfo.siblings?.forEach((s: any) => this.addSibling(s));
  }

  get childrenArray(): FormArray {
    return this.obituaryForm.get('children') as FormArray;
  }
  get siblingsArray(): FormArray {
    return this.obituaryForm.get('siblings') as FormArray;
  }

  addChild(child = { name: '', dateOfBirth: '' }): void {
    this.childrenArray.push(
      this.fb.group({
        name: [child.name, Validators.required],
        dateOfBirth: [child.dateOfBirth, Validators.required],
      })
    );
  }
  removeChild(index: number): void {
    this.childrenArray.removeAt(index);
  }

  addSibling(sibling = { name: '', isAlive: true }): void {
    this.siblingsArray.push(
      this.fb.group({
        name: [sibling.name, Validators.required],
        isAlive: [sibling.isAlive],
      })
    );
  }
  removeSibling(index: number): void {
    this.siblingsArray.removeAt(index);
  }

  onSubmit(): void {
    if (!this.obituaryForm.valid) return;
    const payload = this.obituaryForm.value;
    if (this.obituaryInfo?.id) {
      this.obituaryInfoService
        .updateObituaryInfo(payload, this.obituaryInfo.id)
        .subscribe({
          next: () => {
            this.sharedService.showToast('Obituary updated');
            this.loadObituaryInfo();
          },
          error: (e) => this.sharedService.showToast(e),
        });
    } else {
      this.obituaryInfoService.createObituaryInfo(payload).subscribe({
        next: () => {
          this.sharedService.showToast('Obituary saved');
          this.loadObituaryInfo();
        },
        error: (e) => this.sharedService.showToast(e),
      });
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) this.patchFormValues();
  }

  /** Fetch a single obituary with pagination params (used for edit) */
  getObituaryInfo(): void {
    const qp = objectToQueryParams(this.pageOptions);
    this.obituaryInfoService.getObituaryInfo(qp).subscribe({
      next: (res) => {
        this.obituaryInfo = res.data;
        if (this.obituaryInfo) this.patchFormValues();
      },
      error: (e) =>
        this.sharedService.showToast({
          classname: 'error',
          text: e?.error?.message,
        }),
    });
  }

  /** Open modal to add/edit an obituary */
  openManageObituaryModal(item: any): void {
    const modalRef = this.modalService.open(
      ManageObituaryComponent,
      this.obituaryModalOptions
    );
    modalRef.componentInstance.data = {
      name: item?.id ? 'Edit' : 'Add',
      item: item?.id ? item : null,
      planName: this.planName,
    };
    modalRef.result
      .then(() => {
        this.getObituaryInfo();
        this.getObituaries();
      })
      .catch(() => {});
  }

  private loadUserPlan(): void {
    this.featuresService.getUserPlan().subscribe({
      next: (res: any) => {
        this.planName = res?.plan?.name || null;
      },
      error: () => {
        this.planName = null;
      },
    });
  }

  /** Delete current obituary */
  openDeleteDialog(): void {
    const modalRef = this.modalService.open(ConfirmationModalComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      centered: false,
    });
    modalRef.componentInstance.data = {
      title: 'Delete Obituary Information',
      text: 'Are you sure? This cannot be undone.',
    };
    modalRef.result.then(() => this.deleteObituary()).catch(() => {});
  }

  deleteObituary(): void {
    if (!this.obituaryInfo?.id) return;
    this.obituaryInfoService
      .deleteObituaryInfo(this.obituaryInfo.id)
      .subscribe({
        next: (res) => {
          this.sharedService.showToast({
            classname: 'success',
            text: res?.message,
          });
          this.obituaryInfo = null;
          this.obituaryForm.reset();
        },
        error: (e) =>
          this.sharedService.showToast({
            classname: 'error',
            text: e?.error?.message,
          }),
      });
  }

  /** Load list of all obituaries for display */
  getObituaries(): void {
    const qp = objectToQueryParams(this.pageOptions);
    this.obituaryInfoService.getObituaries(qp).subscribe({
      next: (res) => {
        this.obituaries = res.data;
        this.hasObituary = !!this.obituaries?.length;
        this.latestObituary = this.obituaries?.[0] ?? null;
        if (this.obituaries?.length)
          this.arrangeObituariesByYear(this.obituaries);
        else {
          this.hasObituary = false;
          this.latestObituary = null;
        }
      },
      error: (e) =>
        this.sharedService.showToast({
          classname: 'error',
          text: e?.error?.message,
        }),
    });
  }

  /** Group obituaries by birth year (newest first) */
  arrangeObituariesByYear(obituaries: any[]): void {
    this.obituariesListByYear = [];
    if (!obituaries?.length) return;
    const sorted = [...obituaries].sort(
      (a, b) =>
        new Date(b.date_of_birth).getTime() -
        new Date(a.date_of_birth).getTime()
    );
    let startYear = new Date(sorted[0].date_of_birth).getFullYear();
    const endYear = new Date(
      sorted[sorted.length - 1].date_of_birth
    ).getFullYear();
    while (startYear >= endYear) {
      const list = sorted.filter(
        (o) => new Date(o.date_of_birth).getFullYear() === startYear
      );
      if (list.length) this.obituariesListByYear.push(list);
      startYear--;
    }
  }

  openObituaryPopup(item: any): void {
    const modalRef = this.modalService.open(
      ManageObituaryComponent,
      this.obituaryModalOptions
    );
    modalRef.componentInstance.data = {
      name: item?.id ? 'Edit' : 'Add',
      item: item?.id ? item : null,
    };
    modalRef.result
      .then(() => {
        this.getObituaryInfo();
        this.getObituaries();
      })
      .catch(() => {});
  }

  seeMore(date: any): void {
    if (!date) return;
    const year = new Date(date).getFullYear();
    this.router.navigate([`/obituary-info/${year}`]);
  }

  getYearFromDate(date: any): number {
    if (!date) return 0;
    return new Date(date).getFullYear();
  }

  private maybeAutoOpenManageModal(): void {
    if (this.autoOpenedManageModal) return;
    const openAdd = this.route.snapshot.queryParamMap.get('openAdd') === '1';
    if (!openAdd) return;
    this.autoOpenedManageModal = true;
    this.openManageObituaryModal(null);
  }

  // =========================
  // Display helpers (UI-only)
  // =========================

  isNonEmpty(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  formatDate(value: any): string {
    if (!value) return '';
    if (typeof value === 'string') {
      const s = value.trim();
      if (!s) return '';
      if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return s.slice(0, 10);
    }
    try {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return String(value).slice(0, 10);
    } catch {
      return String(value).slice(0, 10);
    }
  }

  asArray<T = any>(value: any): T[] {
    if (!value) return [];
    if (Array.isArray(value)) return value as T[];
    if (typeof value === 'string') {
      const s = value.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed)
          ? (parsed as T[])
          : parsed
            ? [parsed as T]
            : [];
      } catch {
        if (s.includes(',')) {
          return s
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean) as any;
        }
        return [s as any];
      }
    }
    return [value as T];
  }

  joinParts(...parts: any[]): string {
    return parts
      .filter((p) => p !== null && p !== undefined)
      .map((p) => (typeof p === 'string' ? p.trim() : String(p)))
      .filter(Boolean)
      .join(' ');
  }

  formatLocation(city?: any, state?: any, place?: any): string {
    const a = [city, state].filter(Boolean).join(', ').trim();
    if (a) return a;
    return (place || '').toString();
  }

  get headerSummary(): string {
    if (!this.latestObituary) return '';
    const dob = this.formatDate(this.latestObituary?.date_of_birth);
    const dod = this.formatDate(this.latestObituary?.date_of_death);
    const location = this.formatLocation(
      this.latestObituary?.birth_city,
      this.latestObituary?.birth_state,
      this.latestObituary?.place_of_birth
    );
    const parts = [
      dob ? `Born ${dob}` : '',
      dod ? `Died ${dod}` : '',
      location || '',
    ].filter(Boolean);
    return parts.join(' - ');
  }

  formatAdvancedText(value: any): string {
    if (value === null || value === undefined) return '';

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          return this.formatAdvancedText(JSON.parse(trimmed));
        } catch {
          return trimmed;
        }
      }
      return trimmed;
    }

    if (Array.isArray(value)) {
      const texts = value
        .map((v) => this.extractText(v))
        .filter((t) => !!t);
      return texts.join('\n');
    }

    if (typeof value === 'object') {
      return this.extractText(value);
    }

    return String(value);
  }

  private extractText(v: any): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v.trim();

    if (typeof v === 'object') {
      if (typeof v.text === 'string') return v.text.trim();
      if (typeof v.value === 'string') return v.value.trim();
      if (typeof v.name === 'string') return v.name.trim();

      const maybeTexts = Object.values(v)
        .map((x) => (typeof x === 'string' ? x.trim() : ''))
        .filter(Boolean);

      if (maybeTexts.length === 1) return maybeTexts[0];
    }

    return '';
  }

  stringifyDisplay(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      const items = value
        .map((v) => this.stringifyDisplay(v))
        .map((v) => v.trim())
        .filter(Boolean);
      return items.join(', ');
    }

    try {
      if (typeof value === 'object') {
        const anyVal: any = value;
        if (anyVal.name) return this.stringifyDisplay(anyVal.name);
        if (anyVal.label) return this.stringifyDisplay(anyVal.label);
        if (anyVal.value) return this.stringifyDisplay(anyVal.value);
        return JSON.stringify(value, null, 2);
      }
    } catch {
      // ignore
    }

    return String(value);
  }

  private normalizeLegacyKey(key: string): string {
    if (!key) return '';
    return key
      .replace(/^item\s*\d+\s*[:\-]?\s*/i, '')
      .replace(/^[^a-zA-Z0-9]+\s*/, '')
      .trim();
  }

  toKeyValueRows(value: any): Array<{ key: string; value: string }> {
    if (!value) return [];

    if (typeof value === 'string') {
      const s = value.trim();
      if (!s) return [];
      try {
        const parsed = JSON.parse(s);
        return this.toKeyValueRows(parsed);
      } catch {
        return [];
      }
    }

    if (Array.isArray(value)) {
      const allObjects = value.every(
        (v) => v && typeof v === 'object' && !Array.isArray(v)
      );
      if (!allObjects) return [];
      const rows: Array<{ key: string; value: string }> = [];
      value.forEach((obj) => {
        const keys = Object.keys(obj || {});
        if (!keys.length) return;
        keys.forEach((k) => {
          const normalizedKey = this.normalizeLegacyKey(k);
          if (!normalizedKey) return;
          rows.push({
            key: normalizedKey,
            value: this.stringifyDisplay((obj as any)[k]),
          });
        });
      });
      return rows;
    }

    if (typeof value === 'object') {
      const obj = value as Record<string, any>;
      return Object.keys(obj).map((k) => ({
        key: this.normalizeLegacyKey(k),
        value: this.stringifyDisplay(obj[k]),
      }));
    }

    return [];
  }

  trackByKeyValueRow = (
    _: number,
    row: { key: string; value: string }
  ): string => `${row.key}|${row.value}`;

}
