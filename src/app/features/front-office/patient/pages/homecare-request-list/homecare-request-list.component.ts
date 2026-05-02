import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomecareService } from '../../../../../services/homecare.service';
import { ServiceRequest } from '../../../../../models/homecare.model';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-homecare-request-list',
  templateUrl: './homecare-request-list.component.html',
  styleUrls: ['./homecare-request-list.component.scss']
})
export class HomecareRequestListComponent implements OnInit, OnDestroy {
  requests: ServiceRequest[] = [];
  isLoading = true;
  error = '';
  
  private stompClient: Client | null = null;

  constructor(private homecareService: HomecareService) {}

  ngOnInit(): void {
    this.loadRequests();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }

  connectWebSocket(): void {
    const socket = new SockJS('http://localhost:8081/springsecurity/ws');
    this.stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
    });

    const token = localStorage.getItem('token');
    if (token) {
      this.stompClient.connectHeaders = {
        Authorization: `Bearer ${token}`
      };
    }

    this.stompClient.onConnect = () => {
      this.stompClient?.subscribe(`/user/queue/homecare`, (message: IMessage) => {
        alert("🔔 Notification: " + message.body);
        this.loadRequests();
      });
    };

    this.stompClient.activate();
  }

  loadRequests(): void {
    this.homecareService.getMyRequests().subscribe({
      next: (data) => {
        this.requests = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load requests.';
        this.isLoading = false;
      }
    });
  }

  cancelRequest(id: number): void {
    if (confirm('Are you sure you want to cancel this request?')) {
      this.homecareService.cancelRequest(id).subscribe({
        next: () => {
          this.loadRequests(); // refresh
        },
        error: (err) => {
          alert('Failed to cancel request. It may be already in progress.');
        }
      });
    }
  }

  completeRequest(id: number): void {
    if (confirm('Are you sure the provider has finished the intervention?')) {
      this.homecareService.completeRequestAsPatient(id).subscribe({
        next: () => {
          this.loadRequests();
          alert('Intervention marked as completed. You can now leave a review!');
        },
        error: (err) => {
          alert('Failed to complete the intervention.');
        }
      });
    }
  }

  openReview(id: number): void {
    const rawRating = prompt('Give a rating from 1 to 5:');
    if (rawRating === null) return;
    
    const rating = parseInt(rawRating || '0', 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      alert('Invalid rating. Must be between 1 and 5.');
      return;
    }

    const comment = prompt('Optional - Write a review comment:') || undefined;

    this.homecareService.submitReview(id, { rating, comment }).subscribe({
      next: () => {
        alert('Thank you! Your review has been submitted.');
        this.loadRequests();
      },
      error: () => {
        alert('Failed to submit review. You might have already reviewed this request.');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING': return 'badge-warning';
      case 'ACCEPTED': return 'badge-primary';
      case 'IN_PROGRESS': return 'badge-info';
      case 'COMPLETED': return 'badge-success';
      case 'CANCELLED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }
}
