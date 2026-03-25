import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorConsultationsComponent } from './doctor-consultations.component';

describe('DoctorConsultationsComponent', () => {
  let component: DoctorConsultationsComponent;
  let fixture: ComponentFixture<DoctorConsultationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DoctorConsultationsComponent]
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
