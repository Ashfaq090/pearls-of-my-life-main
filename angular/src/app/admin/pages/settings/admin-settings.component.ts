import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.scss'],
})
export class AdminSettingsComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.settingsForm = this.fb.group({
      paypalMode: ['sandbox'],
      paypalClientId: [''],
      paypalClientSecret: [''],
      emailFrom: [''],
      adminEmail: [''],
      maxFileSize: [100],
      allowedFileTypes: [''],
    });
  }

  ngOnInit() {
    // Load settings from backend (to be implemented)
  }

  saveSettings() {
    // Save settings to backend (to be implemented)
    alert('Settings saved (Backend API to be implemented)');
  }
}

