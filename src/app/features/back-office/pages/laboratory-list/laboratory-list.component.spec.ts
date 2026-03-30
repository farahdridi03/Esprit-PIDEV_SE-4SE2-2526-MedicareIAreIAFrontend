import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryListComponent } from './laboratory-list.component';
describe('LaboratoryListComponent', () => {
  let component: LaboratoryListComponent;
  let fixture: ComponentFixture<LaboratoryListComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule, RouterTestingModule], declarations: [LaboratoryListComponent] }).compileComponents();
    fixture = TestBed.createComponent(LaboratoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
