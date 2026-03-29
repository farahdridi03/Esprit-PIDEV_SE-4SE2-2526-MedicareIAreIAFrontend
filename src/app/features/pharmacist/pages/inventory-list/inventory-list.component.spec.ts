import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { InventoryListComponent } from './inventory-list.component';
import { StockService } from '../../../../services/stock.service';
import { PharmacyService } from '../../../../services/pharmacy.service';
import { FormsModule } from '@angular/forms';

describe('InventoryListComponent', () => {
  let component: InventoryListComponent;
  let fixture: ComponentFixture<InventoryListComponent>;
  let stockServiceSpy: jasmine.SpyObj<StockService>;
  let pharmacyServiceSpy: jasmine.SpyObj<PharmacyService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockPharmacies = [
    { id: 1, name: 'Pharmacy A' },
    { id: 2, name: 'Pharmacy B' }
  ];

  const mockStocks = [
    { id: 101, totalQuantity: 50, minQuantityThreshold: 5, product: { name: 'Paracetamol' } as any, pharmacy: { id: 1 } as any }
  ];

  beforeEach(async () => {
    stockServiceSpy = jasmine.createSpyObj('StockService', ['getStockByPharmacyId']);
    pharmacyServiceSpy = jasmine.createSpyObj('PharmacyService', ['getAllPharmacies']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [ InventoryListComponent ],
      imports: [ FormsModule ],
      providers: [
        { provide: StockService, useValue: stockServiceSpy },
        { provide: PharmacyService, useValue: pharmacyServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryListComponent);
    component = fixture.componentInstance;
    
    pharmacyServiceSpy.getAllPharmacies.and.returnValue(of(mockPharmacies as any));
    stockServiceSpy.getStockByPharmacyId.and.returnValue(of(mockStocks as any));
  });

  it('should create and load pharmacies on init', fakeAsync(() => {
    fixture.detectChanges(); // ngOnInit calls loadPharmacies
    tick();

    expect(component).toBeTruthy();
    expect(pharmacyServiceSpy.getAllPharmacies).toHaveBeenCalled();
    expect(component.pharmacies.length).toBe(2);
    expect(component.selectedPharmacyId).toBe(1); // Auto-selects first pharmacy
    
    expect(stockServiceSpy.getStockByPharmacyId).toHaveBeenCalledWith(1);
    expect(component.stocks.length).toBe(1);
    expect(component.stocks[0].product.name).toBe('Paracetamol');
  }));

  it('should reload inventory when pharmacy is changed', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    
    stockServiceSpy.getStockByPharmacyId.calls.reset();
    
    component.selectedPharmacyId = 2;
    component.onPharmacyChange();
    tick();
    
    expect(stockServiceSpy.getStockByPharmacyId).toHaveBeenCalledWith(2);
    expect(component.loading).toBeFalse();
  }));

  it('should navigate to batches view', () => {
    component.viewBatches(101);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pharmacist/stock/batches', 101]);
  });

  it('should navigate to movements view', () => {
    component.viewMovements(101);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/pharmacist/stock/movements', 101]);
  });

  it('should handle failure in loading inventory', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    stockServiceSpy.getStockByPharmacyId.and.returnValue(of(null as any)); // Mock empty or error
    component.loadInventory();
    tick();

    expect(component.loading).toBeFalse();
  }));
});
