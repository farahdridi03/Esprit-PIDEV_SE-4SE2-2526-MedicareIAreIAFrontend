import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService, DoctorProfile } from '../../../../../services/doctor.service';

@Component({
  selector: 'app-patient-doctors-list',
  templateUrl: './patient-doctors-list.component.html',
  styleUrls: ['./patient-doctors-list.component.scss']
})
export class PatientDoctorsListComponent implements OnInit {
  doctors: DoctorProfile[] = [];
  filteredDoctors: DoctorProfile[] = [];
  searchTerm: string = '';
  selectedSpecialty: string = '';
  specialties: string[] = [];
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading = true;
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.filteredDoctors = data;
        
        // Extract unique specialties
        const allSpecs = data.map(d => d.specialty).filter(s => s) as string[];
        this.specialties = [...new Set(allSpecs)].sort();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching doctors:', err);
        this.error = 'Failed to load doctors list. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  filterDoctors(): void {
    this.filteredDoctors = this.doctors.filter(doctor => {
      const searchTxt = this.searchTerm.toLowerCase();
      const matchSearch = this.searchTerm ? 
        (doctor.fullName?.toLowerCase().includes(searchTxt) || 
         doctor.specialty?.toLowerCase().includes(searchTxt)) : true;
      const matchSpecialty = this.selectedSpecialty ? doctor.specialty === this.selectedSpecialty : true;
      return matchSearch && matchSpecialty;
    });
  }

  viewProfile(doctorId: number): void {
    this.router.navigate(['/front/patient/doctors', doctorId]);
  }
}
