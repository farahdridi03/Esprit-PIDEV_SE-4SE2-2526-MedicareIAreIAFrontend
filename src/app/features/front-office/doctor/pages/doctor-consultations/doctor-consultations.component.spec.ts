import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { DoctorConsultationsComponent } from './doctor-consultations.component';

describe('DoctorConsultationsComponent', () => {
  let component: DoctorConsultationsComponent;
  let fixture: ComponentFixture<DoctorConsultationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [DoctorConsultationsComponent],
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

    fixture = TestBed.createComponent(DoctorConsultationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
