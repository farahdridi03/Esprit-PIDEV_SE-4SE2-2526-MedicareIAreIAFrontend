import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClinicAmbulancesComponent } from './clinic-ambulances.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { AmbulanceService } from '../../../../../services/ambulance.service';
import { AuthService } from '../../../../../services/auth.service';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';

describe('ClinicAmbulancesComponent', () => {
  let component: ClinicAmbulancesComponent;
  let fixture: ComponentFixture<ClinicAmbulancesComponent>;
  let ambulanceServiceMock: any;
  let authServiceMock: any;

  beforeEach(async () => {
    ambulanceServiceMock = {
      getByClinic: jasmine.createSpy('getByClinic').and.returnValue(of([])),
      create: jasmine.createSpy('create').and.returnValue(of({ id: 99, licensePlate: 'NEW-123' })),
      update: jasmine.createSpy('update').and.returnValue(of({ id: 1, licensePlate: 'UPD-123' })),
      delete: jasmine.createSpy('delete').and.returnValue(of({}))
    };

    authServiceMock = {
      getUserId: jasmine.createSpy('getUserId').and.returnValue(1)
    };

    await TestBed.configureTestingModule({
      declarations: [ClinicAmbulancesComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        { provide: AmbulanceService, useValue: ambulanceServiceMock },
        { provide: AuthService, useValue: authServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClinicAmbulancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load ambulances on init', () => {
    expect(authServiceMock.getUserId).toHaveBeenCalled();
    expect(ambulanceServiceMock.getByClinic).toHaveBeenCalledWith(1);
  });

  it('should calculate ambulances with GPS count correctly', () => {
    component.ambulances = [
      { id: 1, currentLat: 10, currentLng: 20 } as any,
      { id: 2, currentLat: null, currentLng: null } as any
    ];
    expect(component.ambulancesWithGpsCount).toBe(1);
  });

  it('should open and cancel form', () => {
    component.openAddForm();
    expect(component.showForm).toBeTrue();
    expect(component.editingId).toBeNull();

    component.cancelForm();
    expect(component.showForm).toBeFalse();
  });

  it('should open edit form with ambulance data', () => {
    const amb = { id: 5, licensePlate: 'TEST-111', status: 'ON_MISSION' } as any;
    component.openEditForm(amb);
    expect(component.showForm).toBeTrue();
    expect(component.editingId).toBe(5);
    expect(component.form.licensePlate).toBe('TEST-111');
  });

  it('should call create when submitting a new ambulance', () => {
    component.form.licensePlate = 'XYZ';
    component.editingId = null;
    component.submitForm();
    expect(ambulanceServiceMock.create).toHaveBeenCalled();
    expect(component.ambulances.length).toBe(1);
  });

  it('should call update when submitting an edited ambulance', () => {
    component.ambulances = [{ id: 1, licensePlate: 'OLD' } as any];
    component.form.licensePlate = 'UPD-123';
    component.editingId = 1;

    component.submitForm();
    expect(ambulanceServiceMock.update).toHaveBeenCalled();
    expect(component.ambulances[0].licensePlate).toBe('UPD-123');
  });

  it('should delete ambulance after confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.ambulances = [{ id: 1 } as any];
    
    component.delete(1);
    expect(ambulanceServiceMock.delete).toHaveBeenCalledWith(1);
    expect(component.ambulances.length).toBe(0);
  });
});
