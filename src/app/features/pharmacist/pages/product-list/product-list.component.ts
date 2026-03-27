import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../../services/product.service';
import { Product, ProductRequest, ProductType, ProductUnit } from '../../../../models/product.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  viewState: 'list' | 'add' | 'edit' = 'list';

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
      next: (res) => {
        this.products = res;
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
    this.viewState = 'add';
  }

  viewEdit(p: Product) {
    this.formModel = { ...p };
    this.currentId = p.id;
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
          this.loading = false;
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
          this.loading = false;
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
}
