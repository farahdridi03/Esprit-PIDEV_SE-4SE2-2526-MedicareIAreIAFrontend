import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../../services/product.service';
import { Product, ProductRequest, ProductType, ProductUnit } from '../../../../../models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  viewState: 'list' | 'add' | 'edit' = 'list';

  currentPage = 1; pageSize = 8;
  get totalPages() { return Math.ceil(this.products.length / this.pageSize); }
  get pagedProducts() { const s = (this.currentPage - 1) * this.pageSize; return this.products.slice(s, s + this.pageSize); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageEnd() { return Math.min(this.currentPage * this.pageSize, this.products.length); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }
  fieldErrors: { [key: string]: string } = {};
  globalError: string | null = null;

  productTypes = Object.values(ProductType);
  productUnits = Object.values(ProductUnit);

  currentId: number | null = null;
  formModel: ProductRequest = {
    name: '',
    description: '',
    imageUrl: '',
    manufacturer: '',
    brand: '',
    category: '',
    type: ProductType.MEDICATION,
    barcode: '',
    unit: ProductUnit.PIECE
  };

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (res: Product[]) => {
        this.products = res;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to get products', err);
        this.loading = false;
      }
    });
  }

  viewAdd() {
    this.formModel = {
      name: '', description: '', imageUrl: '', manufacturer: '', brand: '', category: '', type: ProductType.MEDICATION, barcode: '', unit: ProductUnit.PIECE
    };
    this.currentId = null;
    this.fieldErrors = {};
    this.globalError = null;
    this.viewState = 'add';
  }

  viewEdit(p: Product) {
    this.formModel = { ...p };
    this.currentId = p.id;
    this.fieldErrors = {};
    this.globalError = null;
    this.viewState = 'edit';
  }

  cancelForm() {
    this.viewState = 'list';
  }

  saveProduct() {
    this.loading = true;
    if (this.viewState === 'add') {
      this.productService.createProduct(this.formModel).subscribe({
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
      this.productService.updateProduct(this.currentId, this.formModel).subscribe({
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

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.loading = true;
      this.productService.deleteProduct(id).subscribe({
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
      this.globalError = 'An unexpected error occurred while saving the product.';
    }
  }
}