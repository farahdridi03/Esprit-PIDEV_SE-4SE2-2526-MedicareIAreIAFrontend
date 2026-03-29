import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrontOfficeComponent } from './front-office.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FrontOfficeComponent', () => {
  let component: FrontOfficeComponent;
  let fixture: ComponentFixture<FrontOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrontOfficeComponent],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrontOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
