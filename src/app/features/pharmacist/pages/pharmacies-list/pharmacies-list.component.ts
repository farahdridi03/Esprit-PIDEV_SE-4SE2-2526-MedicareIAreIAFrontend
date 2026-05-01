import { Component, OnInit } from '@angular/core';
import { PharmacyService } from '../../../../services/pharmacy.service';
import { Pharmacy, PharmacyRequest } from '../../../../models/pharmacy.model';

@Component({
  selector: 'app-pharmacies-list',
  templateUrl: './pharmacies-list.component.html',
  styleUrls: ['./pharmacies-list.component.scss']
})
export class PharmaciesListComponent implements OnInit {
  pharmacies: Pharmacy[] = [];
  loading = false;
  viewState: 'list' | 'add' | 'edit' = 'list';
  fieldErrors: { [key: string]: string } = {};
  globalError: string | null = null;

  currentId: number | null = null;
  formModel: PharmacyRequest = {
    name: '',
    address: '',
    locationLat: 0,
    locationLng: 0,
    phoneNumber: '',
    email: ''
  };

  constructor(private pharmacyService: PharmacyService) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.pharmacyService.getAllPharmacies().subscribe({
      next: (res) => {
        this.pharmacies = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to get pharmacies', err);
        this.loading = false;
      }
    });
  }

  viewAdd() {
    this.formModel = { name: '', address: '', locationLat: 0, locationLng: 0, phoneNumber: '', email: '' };
    this.currentId = null;
    this.fieldErrors = {};
    this.globalError = null;
    this.viewState = 'add';
  }

  viewEdit(p: Pharmacy) {
    this.formModel = {
      name: p.name,
      address: p.address,
      locationLat: p.locationLat,
      locationLng: p.locationLng,
      phoneNumber: p.phoneNumber,
      email: p.email
    };
    this.currentId = p.id;
    this.fieldErrors = {};
    this.globalError = null;
    this.viewState = 'edit';
  }

  cancelForm() {
    this.viewState = 'list';
  }

  savePharmacy() {
    this.loading = true;
    if (this.viewState === 'add') {
      this.pharmacyService.createPharmacy(this.formModel).subscribe({
        next: () => {
          this.viewState = 'list';
          this.refresh();
        },
        error: (err) => {
          console.error('Create error', err);
          this.handleFormError(err);
        }
      });
    } else if (this.viewState === 'edit' && this.currentId) {
      this.pharmacyService.updatePharmacy(this.currentId, this.formModel).subscribe({
        next: () => {
          this.viewState = 'list';
          this.refresh();
        },
        error: (err) => {
          console.error('Update error', err);
          this.handleFormError(err);
        }
      });
    }
  }

  deletePharmacy(id: number) {
    if (confirm('Are you sure you want to delete this pharmacy?')) {
      this.loading = true;
      this.pharmacyService.deletePharmacy(id).subscribe({
        next: () => this.refresh(),
        error: (err) => {
          console.error('Delete error', err);
          this.loading = false;
        }
      });
    }
  }

  private handleFormError(err: any) {
    this.loading = false;
    this.fieldErrors = {};
    this.globalError = null;
    
    if (err.error?.fields) {
      this.fieldErrors = err.error.fields;
    } else if (err.error?.message) {
      this.globalError = err.error.message;
    } else {
      this.globalError = 'An unexpected error occurred while saving the pharmacy.';
    }
  }
}
