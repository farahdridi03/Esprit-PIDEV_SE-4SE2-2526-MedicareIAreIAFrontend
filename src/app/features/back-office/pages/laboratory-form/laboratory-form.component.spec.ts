import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryFormComponent } from './laboratory-form.component';
describe('LaboratoryFormComponent', () => {
  let component: LaboratoryFormComponent;
  let fixture: ComponentFixture<LaboratoryFormComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule, RouterTestingModule], declarations: [LaboratoryFormComponent] }).compileComponents();
    fixture = TestBed.createComponent(LaboratoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
