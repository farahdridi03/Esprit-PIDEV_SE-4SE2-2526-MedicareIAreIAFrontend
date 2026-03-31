import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientEventsComponent } from './patient-events.component';

describe('PatientEventsComponent', () => {
  let component: PatientEventsComponent;
  let fixture: ComponentFixture<PatientEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
