import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { DoctorMedicalRecordComponent } from './doctor-medical-record.component';

describe('DoctorMedicalRecordComponent', () => {
  let component: DoctorMedicalRecordComponent;
  let fixture: ComponentFixture<DoctorMedicalRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [DoctorMedicalRecordComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            queryParams: of({}),
            paramMap: of({
              get: (key: string) => (key === 'id' ? '1' : null)
            })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorMedicalRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
