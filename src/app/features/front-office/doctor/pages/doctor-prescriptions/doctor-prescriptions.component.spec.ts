import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPrescriptionsComponent } from './doctor-prescriptions.component';

describe('DoctorPrescriptionsComponent', () => {
  let component: DoctorPrescriptionsComponent;
  let fixture: ComponentFixture<DoctorPrescriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DoctorPrescriptionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorPrescriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
