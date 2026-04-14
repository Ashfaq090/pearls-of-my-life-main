import { SoundService } from 'src/app/services/sound.service';
import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ObituaryInfoService } from '../obituary-info.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-manage-obituary',
  templateUrl: './manage-obituary.component.html',
  styleUrls: ['./manage-obituary.component.scss'],
})
export class ManageObituaryComponent implements OnInit {
  public obituaryForm: FormGroup;
  @Input() data: any = {};
  public isLegacyPlan = false;
  get showPremiumFields(): boolean {
    return this.isLegacyPlan;
  }

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly obituaryService: ObituaryInfoService,
    private readonly sharedService: SharedService,
    private readonly soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.isLegacyPlan = this.data?.planName === 'Advanced Auto-Obituary Plan';
    this.obituaryForm = this.formBuilder.group({
      birth_name: ['', [Validators.required]],
      married_name: [''],
      current_name: ['', [Validators.required]],
      birth_date: [null, [Validators.required]],
      birth_place: [''], // Legacy field
      birth_city: ['', [Validators.required]],
      birth_state: ['', [Validators.required]],
      parent_names: [''], // Legacy field
      // Biological parents
      biological_mother_first: [''],
      biological_mother_middle: [''],
      biological_mother_last: [''],
      biological_father_first: [''],
      biological_father_middle: [''],
      biological_father_last: [''],
      // Step parents
      stepmother_first: [''],
      stepmother_middle: [''],
      stepmother_last: [''],
      stepfather_first: [''],
      stepfather_middle: [''],
      stepfather_last: [''],
      spouse_name: [''],
      spouse_marriage_date: [null],
      spouse2_name: [''],
      spouse2_marriage_date: [null],
      spouse3_name: [''],
      spouse3_marriage_date: [null],
      children: this.formBuilder.array([]),
      children2: this.formBuilder.array([]),
      children3: this.formBuilder.array([]),
      siblings: this.formBuilder.array([]),
      schools: this.formBuilder.array([]),
      employment: this.formBuilder.array([]),
      career_achievements: this.formBuilder.array([]),
      church_affiliation: this.formBuilder.group({
        church_name: [''],
        titles_held: [''],
        year_joined: [''],
      }),
      other_achievements: this.formBuilder.array([]),
      club_memberships: this.formBuilder.array([]),
      other_group_affiliations: this.formBuilder.array([]),
      greatest_friendships: this.formBuilder.array([]),
      special_instructions: [''],
    });

    if (this.data?.item) {
      this.patchForm();
    }
  }

  patchForm() {
    this.soundService.playClickSound();
    const item = this.data.item;
    this.obituaryForm.patchValue({
      birth_name: item.birth_name || item.full_name || '',
      married_name: item.married_name || '',
      current_name: item.current_name || item.full_name || '',
      birth_date: item.birth_date || item.date_of_birth || null,
      birth_place: item.birth_place || item.place_of_birth || '',
      birth_city: item.birth_city || '',
      birth_state: item.birth_state || '',
      parent_names: item.parent_names || '',
      biological_mother_first: item.biological_mother_first || '',
      biological_mother_middle: item.biological_mother_middle || '',
      biological_mother_last: item.biological_mother_last || '',
      biological_father_first: item.biological_father_first || '',
      biological_father_middle: item.biological_father_middle || '',
      biological_father_last: item.biological_father_last || '',
      stepmother_first: item.stepmother_first || '',
      stepmother_middle: item.stepmother_middle || '',
      stepmother_last: item.stepmother_last || '',
      stepfather_first: item.stepfather_first || '',
      stepfather_middle: item.stepfather_middle || '',
      stepfather_last: item.stepfather_last || '',
      spouse_name: item.spouse_name || '',
      spouse_marriage_date: item.spouse_marriage_date || null,
      spouse2_name: item.spouse2_name || '',
      spouse2_marriage_date: item.spouse2_marriage_date || null,
      spouse3_name: item.spouse3_name || '',
      spouse3_marriage_date: item.spouse3_marriage_date || null,
      church_affiliation: {
        church_name: item.church_affiliation?.church_name || '',
        titles_held: item.church_affiliation?.titles_held || '',
        year_joined: item.church_affiliation?.year_joined || '',
      },
      special_instructions: item.special_instructions || '',
    });

    // Patch children and siblings arrays
    this.clearChildrenArrays();
    this.data.item.children?.forEach((child: any) =>
      this.addChild('children', child)
    );
    this.data.item.children2?.forEach((child: any) =>
      this.addChild('children2', child)
    );
    this.data.item.children3?.forEach((child: any) =>
      this.addChild('children3', child)
    );
    this.data.item.siblings?.forEach((sibling: any) =>
      this.addSibling(sibling)
    );
    this.clearAdvancedArrays();
    this.data.item.schools?.forEach((school: any) =>
      this.addSchool(school)
    );
    this.data.item.employment?.forEach((job: any) =>
      this.addEmployment(job)
    );
    this.data.item.career_achievements?.forEach((entry: any) =>
      this.addCareerAchievement(entry)
    );
    this.data.item.other_achievements?.forEach((entry: any) =>
      this.addOtherAchievement(entry)
    );
    this.data.item.club_memberships?.forEach((entry: any) =>
      this.addClubMembership(entry)
    );
    this.data.item.other_group_affiliations?.forEach((entry: any) =>
      this.addOtherGroupAffiliation(entry)
    );
    this.data.item.greatest_friendships?.forEach((entry: any) =>
      this.addGreatestFriendship(entry)
    );

    this.obituaryForm.updateValueAndValidity();
  }

  addChild(arrayName: 'children' | 'children2' | 'children3', child?: any) {
    const childForm = this.formBuilder.group({
      first: [child?.first || child?.name?.split(' ')[0] || '', Validators.required],
      middle: [child?.middle || child?.name?.split(' ')[1] || ''],
      last: [child?.last || child?.name?.split(' ').slice(2).join(' ') || '', Validators.required],
      relationship: [child?.relationship || ''],
      dateOfBirth: [child?.dateOfBirth || '', Validators.required],
      isLiving: [child?.isLiving !== undefined ? child.isLiving : true],
      // Legacy support
      name: [child?.name || ''],
    });
    this.getChildrenArray(arrayName).push(childForm);
  }

  onChildLivingToggle(childGroup: any, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    childGroup?.get('isLiving')?.setValue(!input.checked);
  }

  removeChild(arrayName: 'children' | 'children2' | 'children3', index: number) {
    this.getChildrenArray(arrayName).removeAt(index);
  }

  addSibling(sibling?: any) {
    const siblingForm = this.formBuilder.group({
      first: [sibling?.first || sibling?.name?.split(' ')[0] || '', Validators.required],
      middle: [sibling?.middle || sibling?.name?.split(' ')[1] || ''],
      last: [sibling?.last || sibling?.name?.split(' ').slice(2).join(' ') || '', Validators.required],
      relationship: [sibling?.relationship || ''],
      deceased: [sibling?.isAlive !== undefined ? !sibling.isAlive : false],
      // Legacy support
      name: [sibling?.name || ''],
    });
    this.siblingsArray.push(siblingForm);
  }

  removeSibling(index: number) {
    this.siblingsArray.removeAt(index);
  }

  get childrenArray() {
    return this.getChildrenArray('children');
  }

  get children2Array() {
    return this.getChildrenArray('children2');
  }

  get children3Array() {
    return this.getChildrenArray('children3');
  }

  get siblingsArray() {
    return this.obituaryForm.get('siblings') as any;
  }

  private getChildrenArray(
    arrayName: 'children' | 'children2' | 'children3'
  ): FormArray {
    return this.obituaryForm.get(arrayName) as FormArray;
  }

  private clearChildrenArrays(): void {
    this.getChildrenArray('children').clear();
    this.getChildrenArray('children2').clear();
    this.getChildrenArray('children3').clear();
    this.siblingsArray.clear();
  }

  private clearAdvancedArrays(): void {
    this.schoolsArray.clear();
    this.employmentArray.clear();
    this.careerAchievementsArray.clear();
    this.otherAchievementsArray.clear();
    this.clubMembershipsArray.clear();
    this.otherGroupAffiliationsArray.clear();
    this.greatestFriendshipsArray.clear();
  }

  get schoolsArray(): FormArray {
    return this.obituaryForm.get('schools') as FormArray;
  }

  get employmentArray(): FormArray {
    return this.obituaryForm.get('employment') as FormArray;
  }

  get careerAchievementsArray(): FormArray {
    return this.obituaryForm.get('career_achievements') as FormArray;
  }

  get otherAchievementsArray(): FormArray {
    return this.obituaryForm.get('other_achievements') as FormArray;
  }

  get clubMembershipsArray(): FormArray {
    return this.obituaryForm.get('club_memberships') as FormArray;
  }

  get otherGroupAffiliationsArray(): FormArray {
    return this.obituaryForm.get('other_group_affiliations') as FormArray;
  }

  get greatestFriendshipsArray(): FormArray {
    return this.obituaryForm.get('greatest_friendships') as FormArray;
  }

  addSchool(school?: any) {
    this.schoolsArray.push(
      this.formBuilder.group({
        school_name: [school?.school_name || ''],
        degree: [school?.degree || ''],
        start_date: [school?.start_date || null],
        end_date: [school?.end_date || null],
      })
    );
  }

  removeSchool(index: number) {
    this.schoolsArray.removeAt(index);
  }

  addEmployment(job?: any) {
    this.employmentArray.push(
      this.formBuilder.group({
        employer: [job?.employer || ''],
        title: [job?.title || ''],
        start_date: [job?.start_date || null],
        end_date: [job?.end_date || null],
      })
    );
  }

  removeEmployment(index: number) {
    this.employmentArray.removeAt(index);
  }

  addCareerAchievement(entry?: any) {
    this.careerAchievementsArray.push(
      this.formBuilder.group({
        title: [entry?.title || ''],
        date: [entry?.date || null],
      })
    );
  }

  removeCareerAchievement(index: number) {
    this.careerAchievementsArray.removeAt(index);
  }

  addOtherAchievement(entry?: any) {
    this.otherAchievementsArray.push(
      this.formBuilder.group({
        text: [entry?.text || ''],
      })
    );
  }

  removeOtherAchievement(index: number) {
    this.otherAchievementsArray.removeAt(index);
  }

  addClubMembership(entry?: any) {
    this.clubMembershipsArray.push(
      this.formBuilder.group({
        text: [entry?.text || ''],
      })
    );
  }

  removeClubMembership(index: number) {
    this.clubMembershipsArray.removeAt(index);
  }

  addOtherGroupAffiliation(entry?: any) {
    this.otherGroupAffiliationsArray.push(
      this.formBuilder.group({
        text: [entry?.text || ''],
      })
    );
  }

  removeOtherGroupAffiliation(index: number) {
    this.otherGroupAffiliationsArray.removeAt(index);
  }

  addGreatestFriendship(entry?: any) {
    this.greatestFriendshipsArray.push(
      this.formBuilder.group({
        text: [entry?.text || ''],
      })
    );
  }

  removeGreatestFriendship(index: number) {
    this.greatestFriendshipsArray.removeAt(index);
  }

  saveAndAddChild(arrayName: 'children' | 'children2' | 'children3'): void {
    const arr = this.getChildrenArray(arrayName);
    if (arr.length === 0) {
      this.addChild(arrayName);
      return;
    }
    const last = arr.at(arr.length - 1) as FormGroup;
    last.markAllAsTouched();
    if (last.valid) {
      this.addChild(arrayName);
    }
  }

  closeModal(): void {
    this.activeModal.close(null);
  }

  submit() {
    this.soundService.playClickSound();
    if (this.obituaryForm.invalid) {
      Object.keys(this.obituaryForm.controls).forEach((key) => {
        const control = this.obituaryForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }
    const form = this.obituaryForm.value;
    
    // Format children and siblings for backend
    form.children = form.children.map((child: any) => ({
      first: child.first,
      middle: child.middle,
      last: child.last,
      relationship: child.relationship,
      dateOfBirth: child.dateOfBirth,
      isLiving: child.isLiving,
    }));
    
    form.children2 = (form.children2 || []).map((child: any) => ({
      first: child.first,
      middle: child.middle,
      last: child.last,
      relationship: child.relationship,
      dateOfBirth: child.dateOfBirth,
      isLiving: child.isLiving,
    }));

    form.children3 = (form.children3 || []).map((child: any) => ({
      first: child.first,
      middle: child.middle,
      last: child.last,
      relationship: child.relationship,
      dateOfBirth: child.dateOfBirth,
      isLiving: child.isLiving,
    }));

    form.siblings = form.siblings.map((sibling: any) => ({
      first: sibling.first,
      middle: sibling.middle,
      last: sibling.last,
      relationship: sibling.relationship,
      isAlive: !sibling.deceased,
    }));
    
    const serviceCall = this.data?.item?.id
      ? this.obituaryService.updateObituaryInfo(form, this.data.item.id)
      : this.obituaryService.createObituaryInfo(form);

    serviceCall.subscribe({
      next: (response: any) => {
        this.sharedService.showToast({
          classname: 'success',
          text: response?.message,
        });
        this.closeModal();
      },
      error: (err: any) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }
}
