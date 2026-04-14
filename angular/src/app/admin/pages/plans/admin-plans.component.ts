import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-plans',
  templateUrl: './admin-plans.component.html',
  styleUrls: ['./admin-plans.component.scss'],
})
export class AdminPlansComponent implements OnInit {
  plans: any[] = [];
  loading: boolean = false;
  showModal: boolean = false;
  planForm: FormGroup;
  editingPlan: any = null;

  constructor(private adminApi: AdminApiService, private fb: FormBuilder) {
    this.planForm = this.fb.group({
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      features: [''],
      isActive: [true],
      max_video_length: [0],
      max_images: [0],
      max_uploads: [0],
      billing_period: ['monthly'],
    });
  }

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.loading = true;
    this.adminApi.getPlans().subscribe({
      next: (data) => {
        this.plans = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading plans:', error);
        this.loading = false;
      },
    });
  }

  openCreateModal() {
    this.editingPlan = null;
    this.planForm.reset({
      isActive: true,
      billing_period: 'monthly',
    });
    this.showModal = true;
  }

  openEditModal(plan: any) {
    this.editingPlan = plan;
    const planData = { ...plan };

    // Parse features if it's a JSON string
    if (planData.features && typeof planData.features === 'string') {
      try {
        const parsed = JSON.parse(planData.features);
        if (Array.isArray(parsed)) {
          planData.features = parsed.join(', ');
        }
      } catch {
        // Keep as is if not valid JSON
      }
    }

    this.planForm.patchValue(planData);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingPlan = null;
    this.planForm.reset();
  }

  savePlan() {
    if (this.planForm.valid) {
      const planData = { ...this.planForm.value };

      // Convert features to JSON string if it's an array or object
      if (planData.features) {
        if (typeof planData.features === 'string') {
          // Try to parse as JSON, if fails, treat as comma-separated
          try {
            JSON.parse(planData.features);
            // Already valid JSON
          } catch {
            // Convert comma-separated to JSON array
            const featuresArray = planData.features
              .split(',')
              .map((f: string) => f.trim())
              .filter((f: string) => f);
            planData.features = JSON.stringify(featuresArray);
          }
        } else if (Array.isArray(planData.features)) {
          planData.features = JSON.stringify(planData.features);
        }
      }

      if (this.editingPlan) {
        this.adminApi.updatePlan(this.editingPlan.id, planData).subscribe({
          next: () => {
            this.loadPlans();
            this.closeModal();
            alert('Plan updated successfully!');
          },
          error: (error) =>
            alert(
              'Error: ' + (error.error?.message || 'Failed to update plan')
            ),
        });
      } else {
        this.adminApi.createPlan(planData).subscribe({
          next: () => {
            this.loadPlans();
            this.closeModal();
            alert('Plan created successfully!');
          },
          error: (error) =>
            alert(
              'Error: ' + (error.error?.message || 'Failed to create plan')
            ),
        });
      }
    }
  }

  deletePlan(id: string) {
    if (confirm('Delete this plan? This will affect existing subscriptions.')) {
      this.adminApi.deletePlan(id).subscribe({
        next: () => this.loadPlans(),
        error: (error) =>
          alert('Error: ' + (error.error?.message || 'Failed to delete plan')),
      });
    }
  }
}
