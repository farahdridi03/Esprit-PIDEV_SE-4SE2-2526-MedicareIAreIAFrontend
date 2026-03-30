import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NutritionistService, NutritionistProfile } from '../../../../../services/nutritionist.service';

@Component({
  selector: 'app-patient-nutritionists-list',
  templateUrl: './patient-nutritionists-list.component.html',
  styleUrls: ['./patient-nutritionists-list.component.scss']
})
export class PatientNutritionistsListComponent implements OnInit {
  Nutritionists: NutritionistProfile[] = [];
  filteredNutritionists: NutritionistProfile[] = [];
  searchTerm: string = '';
  selectedSpecialty: string = '';
  specialties: string[] = [];
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private NutritionistService: NutritionistService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadNutritionists();
  }

  loadNutritionists(): void {
    this.isLoading = true;
    this.NutritionistService.getNutritionists().subscribe({
      next: (data: any) => {
        const adaptedData = data.map((n: any) => ({
          ...n,
          specialty: n.specialties,
          profilePicture: n.photo,
          clinicName: 'Independent'
        }));
        this.Nutritionists = adaptedData;
        this.filteredNutritionists = adaptedData;
        
        // Extract unique specialties
        const allSpecs = adaptedData.map((d: any) => d.specialty).filter((s: string) => s) as string[];
        this.specialties = [...new Set(allSpecs)].sort();
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching Nutritionists:', err);
        this.error = 'Failed to load Nutritionists list. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  filterNutritionists(): void {
    this.filteredNutritionists = this.Nutritionists.filter(Nutritionist => {
      const searchTxt = this.searchTerm.toLowerCase();
      const matchSearch = this.searchTerm ? 
        (Nutritionist.fullName?.toLowerCase().includes(searchTxt) || 
         Nutritionist.specialty?.toLowerCase().includes(searchTxt)) : true;
      const matchSpecialty = this.selectedSpecialty ? Nutritionist.specialty === this.selectedSpecialty : true;
      return matchSearch && matchSpecialty;
    });
  }

  viewProfile(NutritionistId: number): void {
    this.router.navigate(['/front/patient/nutritionists', NutritionistId]);
  }
}
