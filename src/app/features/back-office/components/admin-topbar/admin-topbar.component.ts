import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketNotificationService, WsNotification } from '../../../../services/websocket-notification.service';
import { DonationService } from '../../../../services/donation.service';
import { AidRequestStatus } from '../../../../models/donation.model';

@Component({
  selector: 'app-admin-topbar',
  templateUrl: './admin-topbar.component.html',
  styleUrls: ['./admin-topbar.component.scss']
})
export class AdminTopbarComponent implements OnInit, OnDestroy {
  notifications: WsNotification[] = [];
  unreadCount = 0;
  showDropdown = false;
  private sub!: Subscription;

  constructor(
    private wsNotif: WebSocketNotificationService,
    private donationService: DonationService,
    private elRef: ElementRef
  ) {}

  ngOnInit(): void {
    // Connexion WebSocket + abonnement topic admin
    this.wsNotif.connect();
    this.wsNotif.subscribeAsAdmin();

    this.sub = this.wsNotif.adminNotifications$.subscribe(notifs => {
      this.notifications = notifs;
      this.unreadCount = notifs.filter(n => !n.read).length;
    });

    // Fallback REST : charger les demandes PENDING manquées (notif WS non reçue)
    this.loadPendingAidRequestsAsNotifications();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.wsNotif.unsubscribeAdmin();
  }

  private loadPendingAidRequestsAsNotifications(): void {
    this.donationService.getAidRequestsByStatus(AidRequestStatus.PENDING).subscribe({
      next: (requests) => {
        requests.forEach(req => {
          const syntheticId = `pending_aid_${req.id}`;
          const notif: WsNotification = {
            id: syntheticId,
            title: 'Demande d\'aide en attente',
            message: `${req.patientName || 'Un patient'} a soumis une demande d\'aide (${req.type}).`,
            type: 'aid_request',
            targetUserId: req.patientId,
            timestamp: req.createdAt || new Date().toISOString(),
            read: false
          };
          this.wsNotif.addAdminNotification(notif);
        });
      },
      error: (err) => console.error('[AdminTopbar] Erreur chargement demandes PENDING :', err)
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  markAllRead(): void {
    this.wsNotif.markAdminRead();
  }

  clearAll(): void {
    this.wsNotif.clearAdmin();
  }

  getIcon(type: WsNotification['type']): string {
    if (type === 'aid_request') return '🤝';
    if (type === 'warning') return '⚠️';
    return 'ℹ️';
  }

  timeAgo(date: Date | string): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const diffMs = Date.now() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'À l\'instant';
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Il y a ${diffH}h`;
    return `Il y a ${Math.floor(diffH / 24)}j`;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }
}
