import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LabResultsComponent } from './lab-results.component';
import { LabResultService } from '../../../../../services/lab-result.service';
import { LabTestService } from '../../../../../services/lab-test.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LabResultsComponent', () => {
  let component: LabResultsComponent;
  let fixture: ComponentFixture<LabResultsComponent>;
  let mockLabResultService: jasmine.SpyObj<LabResultService>;
  let mockLabTestService: jasmine.SpyObj<LabTestService>;

  const mockResults: any[] = [
    { id: 1, patientName: 'John', status: 'COMPLETED', isAbnormal: false },
    { id: 2, patientName: 'Jane', status: 'VERIFIED', isAbnormal: true }
  ];

  beforeEach(async () => {
    mockLabResultService = jasmine.createSpyObj('LabResultService', ['getAll', 'delete']);
    mockLabTestService = jasmine.createSpyObj('LabTestService', ['getAll']);

    mockLabResultService.getAll.and.returnValue(of(mockResults));
    mockLabTestService.getAll.and.returnValue(of([{ id: 1, testType: 'Blood Test' } as any]));

    await TestBed.configureTestingModule({
      declarations: [ LabResultsComponent ],
      providers: [
        { provide: LabResultService, useValue: mockLabResultService },
        { provide: LabTestService, useValue: mockLabTestService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load initial data', () => {
    expect(component).toBeTruthy();
    expect(mockLabResultService.getAll).toHaveBeenCalled();
    expect(mockLabTestService.getAll).toHaveBeenCalled();
    expect(component.results.length).toBe(2);
    expect(component.stats.total).toBe(2);
    expect(component.stats.abnormal).toBe(1);
  });

  it('should apply search filters', () => {
    component.results = mockResults;
    component.searchTerm = 'John';
    component.applyFilters();
    expect(component.filteredResults.length).toBe(1);

    component.searchTerm = '';
    component.selectedStatus = 'VERIFIED';
    component.applyFilters();
    expect(component.filteredResults.length).toBe(1);
    expect(component.filteredResults[0].status).toBe('VERIFIED');
  });

  it('should delete a lab result', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    mockLabResultService.delete.and.returnValue(of({} as any));

    component.onDelete(mockResults[0]);

    expect(mockLabResultService.delete).toHaveBeenCalledWith(1);
    expect(component.results.length).toBe(1);
  });

  it('should open create form', () => {
    component.openCreate();
    expect(component.showForm).toBeTrue();
    expect(component.selectedLabTest).toBeNull();
    expect(component.editResult).toBeNull();
  });

  it('should open create form from test', () => {
    const test = { id: 1 } as any;
    component.openCreateFromTest(test);
    expect(component.showForm).toBeTrue();
    expect(component.selectedLabTest).toBe(test);
    expect(component.editResult).toBeNull();
  });

  it('should open edit form', () => {
    const result = mockResults[0];
    component.openEdit(result);
    expect(component.showForm).toBeTrue();
    expect(component.editResult).toBe(result);
  });

  it('should open view details', () => {
    const result = mockResults[0];
    component.openView(result);
    expect(component.showDetail).toBeTrue();
    expect(component.viewResult).toBe(result);
  });

  it('should handle onSaved event', () => {
    component.showForm = true;
    component.onSaved();
    expect(component.showForm).toBeFalse();
    expect(mockLabResultService.getAll).toHaveBeenCalledTimes(2); // Initial + reload
  });

  it('should handle onCancelled event', () => {
    component.showForm = true;
    component.onCancelled();
    expect(component.showForm).toBeFalse();
  });

  it('should return correct status classes', () => {
    expect(component.getStatusClass('COMPLETED')).toContain('badge--completed');
    expect(component.getStatusClass('PENDING')).toContain('badge--pending');
    expect(component.getStatusClass('UNKNOWN')).toContain('badge--pending'); // Default fallback
  });
});
