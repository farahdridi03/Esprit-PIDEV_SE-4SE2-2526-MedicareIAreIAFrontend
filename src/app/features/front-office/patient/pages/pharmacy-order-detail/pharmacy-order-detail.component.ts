import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { PharmacyOrderService } from '../../../../../services/pharmacy-order.service';
import { DeliveryTrackingService } from '../../../../../services/delivery-tracking.service';
import { NotificationService } from '../../../../../services/notification.service';
import { PharmacyOrderResponseDTO } from '../../../../../models/pharmacy-order.model';
import { DeliveryResponseDTO } from '../../../../../models/pharmacy.model';
import { PaymentService } from '../../../../../services/payment.service';
import { PaymentResponseDTO, PaymentMethod } from '../../../../../models/payment.model';
import { AuthService } from '../../../../../services/auth.service';
import { NotificationType } from '../../../../../models/notification.model';

import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-pharmacy-order-detail',
  templateUrl: './pharmacy-order-detail.component.html',
  styleUrls: ['./pharmacy-order-detail.component.scss']
})
export class PharmacyOrderDetailComponent implements OnInit, OnDestroy {
  // Stripe
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private card: StripeCardElement | null = null;
  private stripePublicKey = 'pk_test_51TE0NG4HbbRm2tAHwtazkkoCmoC1S0UBIpFMo6pkqc7kCW1biopCXJnlnAZFOk89bAKAdv0LbCp7HzcVKXuUMYai00Wzu7rxnA';

  orderId!: number;
  order: PharmacyOrderResponseDTO | null = null;
  delivery: DeliveryResponseDTO | null = null;

  isLoading = true;
  error = '';
  cancelReason = '';
  showCancelModal = false;

  showPaymentModal = false;
  paymentSuccess = false;
  existingPayment: PaymentResponseDTO | null = null;
  selectedPaymentMethod: PaymentMethod = PaymentMethod.STRIPE;
  isProcessingPayment = false;

  private routeSub!: Subscription;
  private wsSub!: Subscription;
  private notifSub!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private orderService: PharmacyOrderService,
    private deliveryService: DeliveryTrackingService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const idStr = params.get('id');
      if (idStr) {
        this.orderId = +idStr;
        this.loadOrderDetails();
      }
    });

    // Listen to real-time delivery GPS updates
    this.wsSub = this.deliveryService.deliveryUpdates$.subscribe((update: DeliveryResponseDTO) => {
      console.log('Received WebSocket delivery update!', update);
      this.delivery = update;

      // Update order status if it changed
      if (this.order && update.status) {
        // Map delivery status to order status for the stepper
        let mappedStatus = update.status;
        if (update.status === 'IN_TRANSIT') mappedStatus = 'OUT_FOR_DELIVERY';
        this.order.status = mappedStatus as any;
      }
    });

    // 🚀 Listen for real-time order status updates (when pharmacist validates)
    this.notifSub = this.notificationService.notifications$.subscribe(notifications => {
      if (notifications.length > 0) {
        const latestNotif = notifications[0];
        // When pharmacist validates the order (DELIVERY_CHOICE_REQUIRED notification)
        if ((latestNotif as any).type === NotificationType.DELIVERY_CHOICE_REQUIRED ||
          (latestNotif as any).type === NotificationType.PAYMENT_CONFIRMED) {
          console.log('Order status changed! Reloading order details...', latestNotif.type);
          // Auto-reload the order to show payment button
          setTimeout(() => {
            this.loadOrderDetails();
          }, 1000);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSub) this.routeSub.unsubscribe();
    if (this.wsSub) this.wsSub.unsubscribe();
    if (this.notifSub) this.notifSub.unsubscribe();
    this.deliveryService.disconnect();
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (data) => {
        this.order = data;
        if (this.order.prescriptionImageUrl && !this.order.prescriptionImageUrl.startsWith('http')) {
          this.order.prescriptionImageUrl = 'http://localhost:8081/springsecurity/uploads/prescriptions/' + 
            this.order.prescriptionImageUrl.replace('/uploads/prescriptions/', '').replace('uploads/prescriptions/', '');
        }

        // Connect to WebSocket notifications
        const userEmail = this.authService.getUserEmail();
        if (userEmail) {
          this.deliveryService.connectToUserNotifications(userEmail);
        }

        // If order has a delivery tracking, fetch initial state and connect WebSocket
        if (this.order.status === 'DELIVERY_REQUESTED' ||
          this.order.status === 'ASSIGNING' ||
          this.order.status === 'ASSIGNED' ||
          this.order.status === 'PICKED_UP' ||
          this.order.status === 'OUT_FOR_DELIVERY') {

          this.loadDeliveryTracking();
          this.deliveryService.connectToOrderTracking(this.orderId);
        }

        // Fetch payment info
        this.loadPaymentInfo();

        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load order:', err);
        this.error = 'Impossible de charger la commande.';
        this.isLoading = false;
      }
    });
  }

  loadDeliveryTracking(): void {
    this.deliveryService.getDeliveryDetails(this.orderId).subscribe({
      next: (data: DeliveryResponseDTO) => {
        this.delivery = data;
      },
      error: (err: any) => console.log('Delivery details not found yet')
    });
  }

  goBack(): void {
    this.location.back();
  }

  openCancelModal(): void {
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelReason = '';
  }

  confirmCancel(): void {
    if (!this.cancelReason) return;

    this.orderService.cancelOrder(this.orderId, this.cancelReason).subscribe({
      next: (res) => {
        this.order = res;
        this.closeCancelModal();
      },
      error: (err: any) => {
        alert('Error: unable to cancel this order.');
        this.closeCancelModal();
      }
    });
  }

  downloadInvoice(): void {
    this.orderService.downloadInvoice(this.orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Facture_Commande_${this.orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err: any) => console.error('Failed to download invoice', err)
    });
  }

  loadPaymentInfo(): void {
    this.paymentService.getPaymentByOrderId(this.orderId).subscribe({
      next: (data) => this.existingPayment = data,
      error: (err) => console.log('No payment found for this order yet')
    });
  }

  async openPaymentModal(): Promise<void> {
    this.showPaymentModal = true;
    if (this.selectedPaymentMethod === PaymentMethod.STRIPE) {
      await this.initializeStripe();
      setTimeout(() => {
        if (this.card) this.card.mount('#card-element');
      }, 100);
    }
  }

  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentSuccess = false;
    this.isProcessingPayment = false;
  }

  async onPaymentMethodSelect(method: string): Promise<void> {
    this.selectedPaymentMethod = method as PaymentMethod;
    if (this.selectedPaymentMethod === PaymentMethod.STRIPE) {
      await this.initializeStripe();
      setTimeout(() => {
        if (this.card) this.card.mount('#card-element');
      }, 100);
    }
  }

  processPayment(): void {
    if (this.selectedPaymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
      this.initiateCODPayment();
    } else if (this.selectedPaymentMethod === PaymentMethod.STRIPE) {
      this.initiateStripePayment();
    } else {
      // For D17 or others, still mock or test
      alert('Intégration ' + this.selectedPaymentMethod + ' à venir. Utilisation du mode test.');
      this.initiateMockPayment();
    }
  }

  private async initializeStripe(): Promise<void> {
    if (this.stripe) return;

    this.stripe = await loadStripe(this.stripePublicKey);
    if (this.stripe) {
      this.elements = this.stripe.elements();
      this.card = this.elements.create('card', {
        style: {
          base: {
            color: '#32325d',
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: 'antialiased',
            fontSize: '16px',
            '::placeholder': {
              color: '#aab7c4'
            }
          },
          invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
          }
        }
      });
      // Mount will happen in modal open or via ViewChild
    }
  }

  private initiateStripePayment(): void {
    this.isProcessingPayment = true;

    // 1. Create Payment Intent on backend
    this.paymentService.createPaymentIntent(this.orderId).subscribe({
      next: async (res) => {
        const clientSecret = res.clientSecret; // We now have a dedicated field

        if (!clientSecret || !this.stripe || !this.card) {
          alert('Error initializing Stripe.');
          this.isProcessingPayment = false;
          return;
        }

        // 2. Confirm payment with Stripe
        const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.card,
            billing_details: {
              name: this.authService.getUserFullName() || 'Patient'
            }
          }
        });

        if (error) {
          alert('Payment failed: ' + error.message);
          this.isProcessingPayment = false;
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          // 3. Inform backend to verify and update status
          this.paymentService.verifyPayment(res.id).subscribe({
            next: () => {
              this.paymentSuccess = true;
              this.isProcessingPayment = false;

              setTimeout(() => {
                this.closePaymentModal();
                this.loadOrderDetails();
              }, 1500);
            },
            error: (err) => {
              // Even if verify fails, we know it succeeded on Stripe
              console.error('Verify failed but Stripe succeeded', err);
              this.paymentSuccess = true;
              this.isProcessingPayment = false;
              setTimeout(() => {
                this.closePaymentModal();
                this.loadOrderDetails();
              }, 1500);
            }
          });
        }
      },
      error: (err) => {
        alert('Error creating payment intent.');
        this.isProcessingPayment = false;
      }
    });
  }

  private initiateCODPayment(): void {
    this.isProcessingPayment = true;
    this.paymentService.initiatePayment({
      orderId: this.orderId,
      method: PaymentMethod.CASH_ON_DELIVERY
    }).subscribe({
      next: (res) => {
        this.existingPayment = res;
        this.isProcessingPayment = false;
        this.closePaymentModal();
        this.loadOrderDetails(); // Refresh order status
      },
      error: (err) => {
        alert('Error initiating payment.');
        this.isProcessingPayment = false;
      }
    });
  }

  private initiateMockPayment(): void {
    this.isProcessingPayment = true;

    // Simulate network delay for a more realistic feel
    setTimeout(() => {
      this.paymentService.initiatePayment({
        orderId: this.orderId,
        method: this.selectedPaymentMethod,
        paymentToken: 'tok_mock_success'
      }).subscribe({
        next: (res) => {
          this.existingPayment = res;
          this.paymentSuccess = true;
          this.isProcessingPayment = false;

          // Show success for a moment before closing
          setTimeout(() => {
            this.closePaymentModal();
            this.loadOrderDetails();
          }, 1500);
        },
        error: (err) => {
          alert('Error processing test payment.');
          this.isProcessingPayment = false;
        }
      });
    }, 2000);
  }
}
