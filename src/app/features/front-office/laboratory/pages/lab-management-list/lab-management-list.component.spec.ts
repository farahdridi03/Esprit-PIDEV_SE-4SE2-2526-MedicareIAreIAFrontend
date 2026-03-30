import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LabManagementListComponent } from './lab-management-list.component';
import { LaboratoryService } from '../../../../../services/laboratory.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { LaboratoryResponse } from '../../../../../models/laboratory.model';

describe('LabManagementListComponent', () => {
  let component: LabManagementListComponent;
  let fixture: ComponentFixture<LabManagementListComponent>;
  let mockLaboratoryService: jasmine.SpyObj<LaboratoryService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockLabs: LaboratoryResponse[] = [
    { id: 1, name: 'Lab 1', address: 'Addr 1', phone: '12345678', email: 'lab1@test.com', openingHours: '8-5', specializations: '', isActive: true, createdAt: '2024-03-29' },
    { id: 2, name: 'Lab 2', address: 'Addr 2', phone: '12345678', email: 'lab2@test.com', openingHours: '8-5', specializations: '', isActive: false, createdAt: '2024-03-29' },
    { id: 3, name: 'Lab 3', address: 'Addr 3', phone: '12345678', email: 'lab3@test.com', openingHours: '8-5', specializations: '', isActive: true, createdAt: '2024-03-29' }
  ];

  beforeEach(async () => {
    mockLaboratoryService = jasmine.createSpyObj('LaboratoryService', ['getAll', 'searchByName', 'toggleActive', 'delete']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockLaboratoryService.getAll.and.returnValue(of(JSON.parse(JSON.stringify(mockLabs))));

    await TestBed.configureTestingModule({
      declarations: [ LabManagementListComponent ],
      providers: [
        { provide: LaboratoryService, useValue: mockLaboratoryService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabManagementListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create & load initial labs', () => {
    expect(component).toBeTruthy();
    expect(mockLaboratoryService.getAll).toHaveBeenCalled();
    expect(component.labs.length).toBe(3);
    expect(component.activeLabs).toBe(2);
    expect(component.pendingLabs).toBe(1);
  });

  it('should handle search input', fakeAsync(() => {
    mockLaboratoryService.searchByName.and.returnValue(of([mockLabs[0]]));
    
    component.onSearch('Lab 1');
    tick(400); // Wait for debounceTime

    expect(mockLaboratoryService.searchByName).toHaveBeenCalledWith('Lab 1');
    expect(component.filteredLabs.length).toBe(1);
  }));

  it('should reset search when query is empty', fakeAsync(() => {
    component.onSearch('  ');
    tick(400);

    expect(component.filteredLabs.length).toBe(3);
  }));

  it('should delete a lab successfully', () => {
    mockLaboratoryService.delete.and.returnValue(of({} as any));
    component.deleteTargetId = 1;
    
    component.doDelete();
    
    expect(mockLaboratoryService.delete).toHaveBeenCalledWith(1);
    expect(component.showConfirm).toBeFalse();
    // It should reload labs after delete
    expect(mockLaboratoryService.getAll).toHaveBeenCalledTimes(2);
  });

  it('should handle lab deletion error', () => {
    mockLaboratoryService.delete.and.returnValue(throwError(() => new Error('Delete failed')));
    component.deleteTargetId = 1;
    
    component.doDelete();
    
    expect(component.showConfirm).toBeFalse();
    expect(component.snackbarVisible).toBeTrue();
    expect(component.snackbarType).toBe('error');
  });

  it('should toggle lab active status', () => {
    const updatedLab = { id: 2, name: 'Lab 2', address: 'Addr 2', phone: '12345678', email: 'lab2@test.com', openingHours: '8-5', specializations: '', isActive: true, createdAt: '2024-03-29' };
    mockLaboratoryService.toggleActive.and.returnValue(of(updatedLab));
    
    component.toggleActive(mockLabs[1]);
    
    expect(mockLaboratoryService.toggleActive).toHaveBeenCalledWith(2);
    expect(component.labs.find(l => l.id === 2)?.isActive).toBeTrue();
    expect(component.activeLabs).toBe(3);
  });

  it('should navigate to add page', () => {
    component.goToAdd();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/front/laboratorystaff/laboratories/new']);
  });

  it('should navigate to edit page', () => {
    component.goToEdit(5);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/front/laboratorystaff/laboratories/edit', 5]);
  });
});
