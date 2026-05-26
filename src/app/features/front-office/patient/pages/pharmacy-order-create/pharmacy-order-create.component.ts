import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PharmacyService } from '../../../../../services/pharmacy.service';
import { ProductService } from '../../../../../services/product.service';
import { PharmacyOrderService } from '../../../../../services/pharmacy-order.service';
import { AuthService } from '../../../../../services/auth.service';
import { FileUploadService } from '../../../../../services/file-upload.service';
import {
    PharmacyResponseDTO,
    ProductResponseDTO,
    PharmacyStockResponseDTO
} from '../../../../../models/pharmacy.model';
import { PharmacyOrderRequestDTO } from '../../../../../models/pharmacy-order.model';

interface SelectedProduct {
    product: ProductResponseDTO;
    quantity: number;
}

interface CompatiblePharmacy {
    pharmacyId: number;
    pharmacyName: string;
    totalPrice: number;
    stockDetails: PharmacyStockResponseDTO[];
    matchCount: number;
    missingProducts: string[];
}

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';

@Component({
    selector: 'app-pharmacy-order-create',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, SidebarComponent, TopbarComponent],
    templateUrl: './pharmacy-order-create.component.html',
    styleUrls: ['./pharmacy-order-create.component.scss']
})
export class PharmacyOrderCreateComponent implements OnInit, OnDestroy {
    // Search products
    searchProductName = '';
    availableProducts: ProductResponseDTO[] = [];
    selectedProducts: SelectedProduct[] = [];
    showProductSearch = false;

    // Pharmacies
    allPharmacies: PharmacyResponseDTO[] = [];
    compatiblePharmacies: CompatiblePharmacy[] = [];
    selectedCompatiblePharmacy: CompatiblePharmacy | null = null;
    hasSearchedPharmacies = false;

    // Form data
    deliveryAddress = '';
    scheduledDeliveryDate: string | null = null;
    prescriptionImageUrl = '';
    deliveryType: 'PICKUP' | 'HOME_DELIVERY' = 'PICKUP';

    // States
    isLoading = false;
    isSearchingPharmacies = false;
    isSubmitting = false;
    isUploading = false;
    error = '';
    successMessage = '';

    // Flow steps
    currentStep = 1; // 1: Medicine Selection, 2: Pharmacy Selection, 3: Delivery Options

    private destroy$ = new Subject<void>();

    constructor(
        private pharmacyService: PharmacyService,
        private productService: ProductService,
        private orderService: PharmacyOrderService,
        private authService: AuthService,
        private fileUploadService: FileUploadService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadAllPharmacies();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Step 1: Search and select products
    searchProducts(): void {
        const query = this.searchProductName.trim();
        if (!query) {
            this.availableProducts = [];
            return;
        }

        this.isLoading = true;

        // Support for multi-search (comma-separated)
        const terms = query.split(',').map(t => t.trim()).filter(t => t.length > 0);

        if (terms.length > 1) {
            const searches = terms.map(term => this.productService.searchProducts(term));
            forkJoin(searches).pipe(takeUntil(this.destroy$)).subscribe({
                next: (results) => {
                    // Flatten and deduplicate
                    const allProducts = results.flat();
                    const uniqueMap = new Map<number, ProductResponseDTO>();
                    allProducts.forEach(p => uniqueMap.set(p.id, p));
                    this.availableProducts = Array.from(uniqueMap.values());
                    this.isLoading = false;
                    this.showProductSearch = true;
                },
                error: (err) => {
                    console.error('Multi-search error:', err);
                    this.isLoading = false;
                }
            });
        } else {
            this.productService.searchProducts(query)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (products: ProductResponseDTO[]) => {
                        this.availableProducts = products;
                        this.isLoading = false;
                        this.showProductSearch = true;
                    },
                    error: (err) => {
                        console.error('Error searching products:', err);
                        this.error = 'Error searching for products.';
                        this.isLoading = false;
                    }
                });
        }
    }

    addProductToSelection(product: ProductResponseDTO): void {
        const existing = this.selectedProducts.find(p => p.product.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.selectedProducts.push({ product, quantity: 1 });
        }
        this.showProductSearch = false;
        this.searchProductName = '';
        this.availableProducts = [];
    }

    removeProductFromSelection(index: number): void {
        this.selectedProducts.splice(index, 1);
        this.hasSearchedPharmacies = false;
    }

    updateProductQuantity(index: number, event: Event): void {
        const input = event.target as HTMLInputElement;
        const quantity = +input.value;
        if (quantity <= 0) {
            this.removeProductFromSelection(index);
        } else {
            this.selectedProducts[index].quantity = quantity;
            this.hasSearchedPharmacies = false;
        }
    }

    // Load base pharmacies for metadata
    loadAllPharmacies(): void {
        this.pharmacyService.getAllPharmacies()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.allPharmacies = data;
                },
                error: (err) => {
                    console.error('Error loading pharmacies list:', err);
                }
            });
    }

    // Use batch search and support partial matches
    searchPharmaciesForSelectedProducts(): void {
        if (this.selectedProducts.length === 0) {
            this.error = 'Please add at least one product.';
            return;
        }

        this.error = '';
        this.isSearchingPharmacies = true;
        this.hasSearchedPharmacies = true;
        this.compatiblePharmacies = [];
        this.selectedCompatiblePharmacy = null;

        const productIds = this.selectedProducts.map(sp => sp.product.id);

        this.pharmacyService.searchByProducts(productIds)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (stockList: PharmacyStockResponseDTO[]) => {
                    const pharmacyStockMap = new Map<number, PharmacyStockResponseDTO[]>();

                    stockList.forEach(stock => {
                        if (!pharmacyStockMap.has(stock.pharmacyId)) {
                            pharmacyStockMap.set(stock.pharmacyId, []);
                        }
                        pharmacyStockMap.get(stock.pharmacyId)!.push(stock);
                    });

                    const requiredProductCount = this.selectedProducts.length;

                    for (const [pharmacyId, stockDetails] of pharmacyStockMap.entries()) {
                        let totalPrice = 0;
                        const foundProductIds = stockDetails.map(s => s.productId);

                        stockDetails.forEach(s => {
                            const desiredQty = this.selectedProducts.find(p => p.product.id === s.productId)?.quantity || 0;
                            totalPrice += (s.unitPrice * desiredQty);
                        });

                        const missingProducts = this.selectedProducts
                            .filter(p => !foundProductIds.includes(p.product.id))
                            .map(p => p.product.name);

                        const pharmacyName = this.allPharmacies.find(p => p.id === pharmacyId)?.name || 'Pharmacie Inconnue';

                        this.compatiblePharmacies.push({
                            pharmacyId,
                            pharmacyName,
                            totalPrice,
                            stockDetails,
                            matchCount: stockDetails.length,
                            missingProducts
                        });
                    }

                    // Sort by matchCount (most matches first) then by price
                    this.compatiblePharmacies.sort((a, b) => {
                        if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
                        return a.totalPrice - b.totalPrice;
                    });

                    this.isSearchingPharmacies = false;
                    this.currentStep = 2; // Move to Step 2
                },
                error: (err) => {
                    console.error('Error batch searching pharmacies:', err);
                    this.error = 'Error searching for compatible pharmacies.';
                    this.isSearchingPharmacies = false;
                }
            });
    }

    addAllAvailable(): void {
        this.availableProducts.forEach(p => {
            if (!this.selectedProducts.find(sp => sp.product.id === p.id)) {
                this.selectedProducts.push({ product: p, quantity: 1 });
            }
        });
        this.showProductSearch = false;
        this.searchProductName = '';
        this.availableProducts = [];
    }

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            this.isUploading = true;
            this.error = '';

            this.fileUploadService.uploadFile(file)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (url) => {
                        this.prescriptionImageUrl = url;
                        this.isUploading = false;
                    },
                    error: (err) => {
                        console.error('Upload error:', err);
                        this.error = 'Error uploading prescription.';
                        this.isUploading = false;
                    }
                });
        }
    }

    // Step 2: Select Pharmacy
    selectCompatiblePharmacy(pharmacy: CompatiblePharmacy): void {
        this.selectedCompatiblePharmacy = pharmacy;
        this.currentStep = 3; // Move to Step 3
    }

    // Step 3: Submission
    submitOrder(): void {
        if (!this.validateForm()) {
            return;
        }

        this.isSubmitting = true;
        this.error = '';

        const patientId = this.authService.getUserId();
        if (!patientId) {
            this.error = 'Error: Patient not identified.';
            this.isSubmitting = false;
            return;
        }

        const items = this.selectedCompatiblePharmacy!.stockDetails.map(stock => {
            const desiredQty = this.selectedProducts.find(p => p.product.id === stock.productId)?.quantity || 1;
            return {
                productId: stock.productId,
                quantity: desiredQty,
                price: stock.unitPrice
            };
        });

        const orderRequest: PharmacyOrderRequestDTO = {
            patientId,
            pharmacyId: this.selectedCompatiblePharmacy!.pharmacyId,
            deliveryAddress: this.deliveryAddress,
            scheduledDeliveryDate: this.scheduledDeliveryDate || undefined,
            items: items,
            prescriptionImageUrl: this.prescriptionImageUrl || undefined,
            deliveryType: this.deliveryType
        };

        this.orderService.createOrder(orderRequest)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.successMessage = 'Order created successfully!';
                    this.isSubmitting = false;
                    setTimeout(() => {
                        this.router.navigate(['/front/patient/pharmacy-orders', response.id]);
                    }, 2000);
                },
                error: (err) => {
                    console.error('Error creating order:', err);
                    this.error = err.error?.message || 'Error creating order.';
                    this.isSubmitting = false;
                }
            });
    }

    private validateForm(): boolean {
        this.error = '';

        if (!this.selectedCompatiblePharmacy) {
            this.error = 'Please select a pharmacy.';
            return false;
        }

        if (this.selectedProducts.length === 0) {
            this.error = 'Please add at least one product.';
            return false;
        }

        if (!this.prescriptionImageUrl) {
            this.error = 'Prescription is required to confirm the order.';
            return false;
        }

        if (this.deliveryType === 'HOME_DELIVERY' && !this.deliveryAddress.trim()) {
            this.error = 'Please enter a delivery address.';
            return false;
        }

        return true;
    }

    goBackToStep(step: number): void {
        this.currentStep = step;
        this.error = '';
    }

    goBack(): void {
        this.router.navigate(['/front/patient/pharmacy']);
    }
}
