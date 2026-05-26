import { Component, OnInit } from '@angular/core';
import { PharmacyService } from '../../../../../services/pharmacy.service';
import { PharmacyResponseDTO } from '../../../../../models/pharmacy.model';

@Component({
    selector: 'app-pharmacy',
    templateUrl: './pharmacy.component.html',
    styleUrls: ['./pharmacy.component.scss']
})
export class PharmacyComponent implements OnInit {

    pharmacies: PharmacyResponseDTO[] = [];
    isLoading = true;
    error = '';

    constructor(
        private pharmacyService: PharmacyService
    ) { }

    ngOnInit(): void {
        this.loadPharmacies();
    }

    loadPharmacies(): void {
        this.isLoading = true;
        this.pharmacyService.getAllPharmacies().subscribe({
            next: (data) => {
                this.pharmacies = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Erreur de chargement des pharmacies', err);
                this.error = 'Impossible de charger la liste des pharmacies.';
                this.isLoading = false;
            }
        });
    }


}

