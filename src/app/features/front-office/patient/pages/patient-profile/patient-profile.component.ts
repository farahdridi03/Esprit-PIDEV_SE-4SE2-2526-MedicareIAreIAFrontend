import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../../services/auth.service';

@Component({
  selector: 'app-patient-profile',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.scss']
})
export class PatientProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: any = null;
  isLoading = true;
  showSuccess = false;

  get parentRole() {
    return this.authService.getParentRole();
  }

  get userName() {
    const fullName = this.authService.getUserFullName() || 'User';
    return fullName.split(' ')[0];
  }

  defaultMamaAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=512&auto=format&fit=crop';

  constructor(
    private fb: FormBuilder,
    public authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: [''],
      relationship: [''],
      notifications: [true],
      marketing: [false]
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.isLoading = true;
    // For now, get data from auth service/token
    const email = this.authService.getUserEmail();
    const fullName = this.authService.getUserFullName();
    
    // Simulate real data or fetch from backend if available
    this.user = {
      fullName: fullName || 'Sarah M.',
      email: email || 'sarah.m@example.com',
      phone: '+216 12 345 678',
      address: 'Berges du Lac, Tunis',
      photoUrl: this.defaultMamaAvatar,
      relationship: 'Mama'
    };

    this.profileForm.patchValue({
      fullName: this.user.fullName,
      email: this.user.email,
      phone: this.user.phone,
      address: this.user.address,
      relationship: this.user.relationship || this.parentRole.badge
    });

    this.isLoading = false;
  }

  saveProfile() {
    if (this.profileForm.valid) {
      this.isLoading = true;
      // Simulate API call
      setTimeout(() => {
        this.showSuccess = true;
        this.isLoading = false;
        setTimeout(() => this.showSuccess = false, 3000);
      }, 1000);
    }
  }
}
