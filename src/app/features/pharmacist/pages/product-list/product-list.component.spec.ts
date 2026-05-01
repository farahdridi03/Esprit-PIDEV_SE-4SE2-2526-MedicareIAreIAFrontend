import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ProductService } from '../../../../services/product.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ProductType, ProductUnit } from '../../../../models/product.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  const mockProducts = [
    { id: 1, name: 'Product 1', description: 'Desc 1', type: ProductType.MEDICATION, unit: ProductUnit.PIECE },
    { id: 2, name: 'Product 2', description: 'Desc 2', type: ProductType.DEVICE, unit: ProductUnit.BOX }
  ];

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getAllProducts', 'createProduct', 'updateProduct', 'deleteProduct']);
    
    await TestBed.configureTestingModule({
      declarations: [ ProductListComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: ProductService, useValue: productServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    productServiceSpy.getAllProducts.and.returnValue(of(mockProducts as any));
    fixture.detectChanges();
  });

  it('should create and load products on init', () => {
    expect(component).toBeTruthy();
    expect(productServiceSpy.getAllProducts).toHaveBeenCalled();
    expect(component.products.length).toBe(2);
  });

  describe('View state management', () => {
    it('should show add form when viewAdd is called', () => {
        component.viewAdd();
        expect(component.viewState).toBe('add');
        expect(component.formModel.name).toBe('');
        expect(component.currentId).toBeNull();
    });

    it('should show edit form when viewEdit is called', () => {
        const product = mockProducts[0];
        component.viewEdit(product as any);
        expect(component.viewState).toBe('edit');
        expect(component.formModel.name).toBe('Product 1');
        expect(component.currentId).toBe(1);
    });

    it('should return to list view when cancelForm is called', () => {
        component.viewState = 'add';
        component.cancelForm();
        expect(component.viewState).toBe('list');
    });
  });

  describe('CRUD operations', () => {
    it('should call createProduct when saving in add mode', fakeAsync(() => {
        component.viewAdd();
        component.formModel = { ...mockProducts[0], id: 0 } as any;
        productServiceSpy.createProduct.and.returnValue(of({} as any));
        
        component.saveProduct();
        tick();

        expect(productServiceSpy.createProduct).toHaveBeenCalledWith(component.formModel);
        expect(component.viewState).toBe('list');
        expect(productServiceSpy.getAllProducts).toHaveBeenCalled();
    }));

    it('should call updateProduct when saving in edit mode', fakeAsync(() => {
        component.viewEdit(mockProducts[0] as any);
        component.formModel.name = 'Updated Name';
        productServiceSpy.updateProduct.and.returnValue(of({} as any));
        
        component.saveProduct();
        tick();

        expect(productServiceSpy.updateProduct).toHaveBeenCalledWith(1, component.formModel);
        expect(component.viewState).toBe('list');
    }));

    it('should call deleteProduct and refresh list if confirmed', fakeAsync(() => {
        spyOn(window, 'confirm').and.returnValue(true);
        productServiceSpy.deleteProduct.and.returnValue(of(undefined));
        
        component.deleteProduct(1);
        tick();

        expect(window.confirm).toHaveBeenCalled();
        expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(1);
        expect(productServiceSpy.getAllProducts).toHaveBeenCalled();
    }));

    it('should handle server errors on save', fakeAsync(() => {
        component.viewAdd();
        const errorResponse = {
            error: {
                fields: { name: 'Name must be unique' }
            }
        };
        productServiceSpy.createProduct.and.returnValue(throwError(() => errorResponse));

        component.saveProduct();
        tick();

        expect(component.fieldErrors['name']).toBe('Name must be unique');
        expect(component.loading).toBeFalse();
    }));
  });
});
