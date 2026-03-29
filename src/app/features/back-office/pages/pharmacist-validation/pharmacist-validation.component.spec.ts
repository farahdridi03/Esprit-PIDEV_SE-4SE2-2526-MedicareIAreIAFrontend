import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { PharmacistValidationComponent } from './pharmacist-validation.component';
import { AdminService } from '../../../../services/admin.service';

describe('PharmacistValidationComponent', () => {
  let component: PharmacistValidationComponent;
  let fixture: ComponentFixture<PharmacistValidationComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AdminService', [
      'getPendingPharmacists', 
      'getPendingProviders', 
      'approvePharmacist', 
      'rejectPharmacist',
      'approveProvider',
      'rejectProvider'
    ]);

    await TestBed.configureTestingModule({
      declarations: [PharmacistValidationComponent],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AdminService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacistValidationComponent);
    component = fixture.componentInstance;
    adminServiceSpy = TestBed.inject(AdminService) as jasmine.SpyObj<AdminService>;
    
    adminServiceSpy.getPendingPharmacists.and.returnValue(of([]));
    adminServiceSpy.getPendingProviders.and.returnValue(of([]));
    
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pending pharmacists on init', () => {
    const mockData = [{ id: 1, fullName: 'Pharma 1' }];
    adminServiceSpy.getPendingPharmacists.and.returnValue(of(mockData));
    
    component.ngOnInit();
    
    expect(adminServiceSpy.getPendingPharmacists).toHaveBeenCalled();
    expect(component.pendingPharmacists.length).toBe(1);
  });

  it('should switch tabs and load providers', () => {
    const mockProviders = [{ id: 1, fullName: 'Provider 1' }];
    adminServiceSpy.getPendingProviders.and.returnValue(of(mockProviders));
    
    component.switchTab('PROVIDERS');
    
    expect(component.activeTab).toBe('PROVIDERS');
    expect(adminServiceSpy.getPendingProviders).toHaveBeenCalled();
    expect(component.pendingProviders.length).toBe(1);
  });

  it('should call approvePharmacist when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    adminServiceSpy.approvePharmacist.and.returnValue(of(undefined));
    component.pendingPharmacists = [{ id: 1 }, { id: 2 }];

    component.approvePharmacist(1);

    expect(adminServiceSpy.approvePharmacist).toHaveBeenCalledWith(1);
    expect(component.pendingPharmacists.length).toBe(1);
  });

  it('should call rejectPharmacist when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    adminServiceSpy.rejectPharmacist.and.returnValue(of(undefined));
    component.pendingPharmacists = [{ id: 1 }];

    component.rejectPharmacist(1);

    expect(adminServiceSpy.rejectPharmacist).toHaveBeenCalledWith(1);
    expect(component.pendingPharmacists.length).toBe(0);
  });

  it('should call approveProvider when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    spyOn(window, 'alert');
    adminServiceSpy.approveProvider.and.returnValue(of({}));
    component.pendingProviders = [{ id: 10 }];

    component.approveProvider(10);

    expect(adminServiceSpy.approveProvider).toHaveBeenCalledWith(10);
    expect(component.pendingProviders.length).toBe(0);
  });

  it('should open document in new window', () => {
    spyOn(window, 'open');
    component.viewDocument('cert.pdf');
    expect(window.open).toHaveBeenCalledWith(jasmine.stringMatching(/cert.pdf/), '_blank');
  });

  it('should alert if no document is available', () => {
    spyOn(window, 'alert');
    component.viewDocument(undefined);
    expect(window.alert).toHaveBeenCalledWith('Aucun document disponible.');
  });
});
