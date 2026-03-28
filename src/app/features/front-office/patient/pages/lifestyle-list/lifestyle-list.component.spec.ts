import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LifestyleListComponent } from './lifestyle-list.component';
import { LifestyleService } from '../../../../../services/lifestyle.service';
import { AuthService } from '../../../../../services/auth.service';
import { MOCK_GOALS } from '../../../../../testing/mocks/lifestyle.mock';

describe('LifestyleListComponent', () => {
    let component: LifestyleListComponent;
    let fixture: ComponentFixture<LifestyleListComponent>;
    let lifestyleServiceSpy: jasmine.SpyObj<LifestyleService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let router: Router;

    beforeEach(async () => {
        const lifestyleSpy = jasmine.createSpyObj('LifestyleService', ['getGoals', 'getPlans', 'getTrackings', 'getGoalsByPatientId', 'getPlansByPatientId', 'getTrackingsByPatientId']);
        const authSpy = jasmine.createSpyObj('AuthService', ['getUserRole']);

        // Default returns to avoid 'undefined' subscribe errors
        lifestyleSpy.getGoals.and.returnValue(of([]));
        lifestyleSpy.getPlans.and.returnValue(of([]));
        lifestyleSpy.getTrackings.and.returnValue(of([]));
        lifestyleSpy.getGoalsByPatientId.and.returnValue(of([]));
        lifestyleSpy.getPlansByPatientId.and.returnValue(of([]));
        lifestyleSpy.getTrackingsByPatientId.and.returnValue(of([]));

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [LifestyleListComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: LifestyleService, useValue: lifestyleSpy },
                { provide: AuthService, useValue: authSpy },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        params: of({ type: 'goals' })
                    }
                }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(LifestyleListComponent);
        component = fixture.componentInstance;
        lifestyleServiceSpy = TestBed.inject(LifestyleService) as jasmine.SpyObj<LifestyleService>;
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        router = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set metadata correctly for goals', () => {
        component.type = 'goals';
        component.setMetadata();
        expect(component.title).toBe('Lifestyle Goals');
    });

    it('should call getGoals when type is goals', () => {
        lifestyleServiceSpy.getGoals.and.returnValue(of(MOCK_GOALS));
        component.type = 'goals';
        component.loadData();
        expect(lifestyleServiceSpy.getGoals).toHaveBeenCalled();
        expect(component.data).toEqual(MOCK_GOALS);
    });

    it('should determine create permissions based on role - Patient', () => {
        authServiceSpy.getUserRole.and.returnValue('PATIENT');
        component.ngOnInit();
        
        component.type = 'goals';
        expect(component.canCreate()).toBeTrue();
        
        component.type = 'plans';
        expect(component.canCreate()).toBeFalse();
    });

    it('should determine create permissions based on role - Nutritionist', () => {
        authServiceSpy.getUserRole.and.returnValue('NUTRITIONIST');
        component.ngOnInit();
        
        component.type = 'goals';
        expect(component.canCreate()).toBeFalse();
        
        component.type = 'plans';
        expect(component.canCreate()).toBeTrue();
    });

    it('should navigate to new on create', () => {
        const navigateSpy = spyOn(router, 'navigate');
        component.type = 'goals';
        component.onCreate();
        expect(navigateSpy).toHaveBeenCalledWith(['/front/patient/lifestyle-wellness/goals/new']);
    });
});
