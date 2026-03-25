import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorDiagnosesComponent } from './doctor-diagnoses.component';

describe('DoctorDiagnosesComponent', () => {
  let component: DoctorDiagnosesComponent;
  let fixture: ComponentFixture<DoctorDiagnosesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DoctorDiagnosesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorDiagnosesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
