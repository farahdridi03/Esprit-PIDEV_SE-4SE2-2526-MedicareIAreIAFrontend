import { Component, OnInit, OnDestroy } from '@angular/core';
import { DeliveryService } from '../../../../../services/delivery.service';
import { Delivery, DeliveryStatus } from '../../../../../models/delivery.model';
import { DeliveryAgency, DeliveryAgent } from '../../../../../models/pharmacy.model';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-courier-dashboard',
  templateUrl: './courier-dashboard.component.html',
  styleUrls: ['./courier-dashboard.component.scss']
})
export class CourierDashboardComponent implements OnInit, OnDestroy {
  DeliveryStatus = DeliveryStatus; // Expose enum to template
  agencies: DeliveryAgency[] = [];
  agents: DeliveryAgent[] = [];
  selectedAgencyId: number | null = null;
  selectedAgentId: number | null = null;
  
  currentAgent: DeliveryAgent | null = null;
  assignedDeliveries: Delivery[] = [];
  isLoading = false;
  
  // Real-time simulation
  isSimulatingLocation = false;
  locationSub: Subscription | null = null;
  currentLat = 36.8065; // Tunis default
  currentLng = 10.1815;

  constructor(private deliveryService: DeliveryService) {}

  ngOnInit(): void {
    this.loadAgencies();
  }

  ngOnDestroy(): void {
    this.stopLocationSimulation();
  }

  loadAgencies(): void {
    this.deliveryService.getAgencies().subscribe(data => this.agencies = data);
  }

  onAgencyChange(): void {
    if (this.selectedAgencyId) {
      this.deliveryService.getAgentsByAgency(this.selectedAgencyId).subscribe(data => this.agents = data);
    } else {
      this.agents = [];
    }
  }

  selectAgent(): void {
    if (this.selectedAgentId) {
      this.currentAgent = this.agents.find(a => a.id === this.selectedAgentId) || null;
      // In a real app, this would be based on logged-in user. 
      // Here we simulate by choosing an agent.
      this.loadAssignedDeliveries();
    }
  }

  loadAssignedDeliveries(): void {
    if (!this.currentAgent) return;
    this.isLoading = true;
    this.deliveryService.getDeliveriesByAgent(this.currentAgent.id).subscribe({
      next: (data) => {
        this.assignedDeliveries = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading deliveries', err);
        this.isLoading = false;
      }
    });
  }

  updateStatus(deliveryId: number, status: DeliveryStatus): void {
    this.deliveryService.updateStatus(deliveryId, status).subscribe({
      next: () => {
        alert(`Statut mis à jour : ${status}`);
        this.loadAssignedDeliveries();
      }
    });
  }

  startLocationSimulation(deliveryId: number): void {
    this.isSimulatingLocation = true;
    // Update status to OUT_FOR_DELIVERY
    this.updateStatus(deliveryId, DeliveryStatus.OUT_FOR_DELIVERY);

    this.locationSub = interval(3000).subscribe(() => {
      // Small random movement
      this.currentLat += (Math.random() - 0.5) * 0.001;
      this.currentLng += (Math.random() - 0.5) * 0.001;
      
      console.log(`Simulating movement: ${this.currentLat}, ${this.currentLng}`);
      // Send location update to backend (Phase 3)
      // this.deliveryService.updateLocation(deliveryId, this.currentLat, this.currentLng).subscribe();
    });
  }

  stopLocationSimulation(): void {
    if (this.locationSub) {
      this.locationSub.unsubscribe();
      this.isSimulatingLocation = false;
    }
  }
}
