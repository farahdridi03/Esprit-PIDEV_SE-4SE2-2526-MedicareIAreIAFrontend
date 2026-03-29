import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PharmacistDashboardComponent } from './pharmacist-dashboard.component';
import { PharmacyService } from '../../../../services/pharmacy.service';
import { ProductService } from '../../../../services/product.service';
import { StockService } from '../../../../services/stock.service';

describe('PharmacistDashboardComponent', () => {
  let component: PharmacistDashboardComponent;
  let fixture: ComponentFixture<PharmacistDashboardComponent>;
  let pharmacyServiceSpy: jasmine.SpyObj<PharmacyService>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let stockServiceSpy: jasmine.SpyObj<StockService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    pharmacyServiceSpy = jasmine.createSpyObj('PharmacyService', ['getAllPharmacies']);
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getAllProducts']);
    stockServiceSpy = jasmine.createSpyObj('StockService', ['getAllOpenAlerts']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [ PharmacistDashboardComponent ],
      providers: [
        { provide: PharmacyService, useValue: pharmacyServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: StockService, useValue: stockServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PharmacistDashboardComponent);
    component = fixture.componentInstance;
    
    pharmacyServiceSpy.getAllPharmacies.and.returnValue(of([{}, {}] as any)); // 2 pharmacies
    productServiceSpy.getAllProducts.and.returnValue(of([{}, {}, {}] as any)); // 3 products
    stockServiceSpy.getAllOpenAlerts.and.returnValue(of([{}, {}, {}, {}] as any)); // 4 alerts
  });

  it('should create and load data on init', fakeAsync(() => {
    fixture.detectChanges(); // calls loadData
    tick();

    expect(component).toBeTruthy();
    expect(pharmacyServiceSpy.getAllPharmacies).toHaveBeenCalled();
    expect(productServiceSpy.getAllProducts).toHaveBeenCalled();
    expect(stockServiceSpy.getAllOpenAlerts).toHaveBeenCalled();
    
    expect(component.pharmaciesCount).toBe(2);
    expect(component.productsCount).toBe(3);
    expect(component.alertsCount).toBe(4);
  }));

  it('should navigate to specific paths', () => {
    component.navigate('inventory');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pharmacist/stock', 'inventory']);
  });
});
