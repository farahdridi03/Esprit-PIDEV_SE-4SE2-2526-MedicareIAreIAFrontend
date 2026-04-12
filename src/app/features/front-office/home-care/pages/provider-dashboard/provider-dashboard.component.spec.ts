import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { ProviderDashboardComponent } from './provider-dashboard.component';
import { HomecareService } from '../../../../../services/homecare.service';
import { NotificationService } from '../../../../../services/notification.service';
import { ToastService } from '../../../../../services/toast.service';
import { ServiceRequest } from '../../../../../models/homecare.model';

describe('ProviderDashboardComponent', () => {
  let component: ProviderDashboardComponent;
  let fixture: ComponentFixture<ProviderDashboardComponent>;
  let homecareServiceSpy: jasmine.SpyObj<HomecareService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  
  const notificationsSubject = new BehaviorSubject<any[]>([]);

  beforeEach(async () => {
    const homeSpy = jasmine.createSpyObj('HomecareService', [
      'getProviderRequests', 
      'acceptRequest', 
      'declineRequest', 
      'startRequest', 
      'completeRequest'
    ]);
    const notifSpy = jasmine.createSpyObj('NotificationService', ['notifications$'], {
        notifications$: notificationsSubject.asObservable()
    });
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error', 'info', 'warning']);

    await TestBed.configureTestingModule({
      declarations: [ProviderDashboardComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        { provide: HomecareService, useValue: homeSpy },
        { provide: NotificationService, useValue: notifSpy },
        { provide: ToastService, useValue: toastSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ProviderDashboardComponent);
    component = fixture.componentInstance;
    homecareServiceSpy = TestBed.inject(HomecareService) as jasmine.SpyObj<HomecareService>;
    notificationServiceSpy = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;

    homecareServiceSpy.getProviderRequests.and.returnValue(of([]));
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load requests on init and calculate stats', () => {
    const mockRequests: ServiceRequest[] = [
      { id: 1, status: 'PENDING' } as any,
      { id: 2, status: 'IN_PROGRESS' } as any,
      { id: 3, status: 'COMPLETED' } as any
    ];
    homecareServiceSpy.getProviderRequests.and.returnValue(of(mockRequests));
    
    component.ngOnInit();
    
    expect(homecareServiceSpy.getProviderRequests).toHaveBeenCalled();
    expect(component.requests.length).toBe(3);
    expect(component.stats.pending).toBe(1);
    expect(component.stats.active).toBe(1);
    expect(component.stats.completed).toBe(1);
  });

  it('should reload requests when a new homecare notification arrives', () => {
    homecareServiceSpy.getProviderRequests.calls.reset();
    notificationsSubject.next([{ type: 'NEW_HOMECARE_REQUEST' }]);
    
    expect(homecareServiceSpy.getProviderRequests).toHaveBeenCalled();
  });

  it('should call acceptRequest and show success toast', () => {
    homecareServiceSpy.acceptRequest.and.returnValue(of({} as any));
    
    component.acceptRequest(1);
    
    expect(homecareServiceSpy.acceptRequest).toHaveBeenCalledWith(1);
    expect(toastServiceSpy.success).toHaveBeenCalled();
  });

  it('should call declineRequest when confirmed and show warning toast', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    homecareServiceSpy.declineRequest.and.returnValue(of({} as any));
    
    component.declineRequest(1);
    
    expect(homecareServiceSpy.declineRequest).toHaveBeenCalledWith(1);
    expect(toastServiceSpy.warning).toHaveBeenCalled();
  });

  it('should call startRequest and show info toast', () => {
    homecareServiceSpy.startRequest.and.returnValue(of({} as any));
    
    component.startRequest(1);
    
    expect(homecareServiceSpy.startRequest).toHaveBeenCalledWith(1);
    expect(toastServiceSpy.info).toHaveBeenCalled();
  });

  it('should open complete modal and handle submission', () => {
    component.completeRequest(1);
    expect(component.showCompleteModal).toBeTrue();
    expect(component.selectedRequestId).toBe(1);

    component.completeForm.setValue({ providerNotes: 'Mission accomplished' });
    homecareServiceSpy.completeRequest.and.returnValue(of({} as any));

    component.submitComplete();

    expect(homecareServiceSpy.completeRequest).toHaveBeenCalled();
    expect(toastServiceSpy.success).toHaveBeenCalledWith('Intervention marquée comme terminée !');
    expect(component.showCompleteModal).toBeFalse();
  });

  it('should handle error when loading requests', () => {
    homecareServiceSpy.getProviderRequests.and.returnValue(throwError(() => new Error('Error')));
    
    component.loadRequests();
    
    expect(toastServiceSpy.error).toHaveBeenCalled();
  });
});
