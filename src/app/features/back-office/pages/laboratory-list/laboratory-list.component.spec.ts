import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoryListComponent } from './laboratory-list.component';
describe('LaboratoryListComponent', () => {
  let component: LaboratoryListComponent;
  let fixture: ComponentFixture<LaboratoryListComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ declarations: [LaboratoryListComponent] }).compileComponents();
    fixture = TestBed.createComponent(LaboratoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => { expect(component).toBeTruthy(); });
});
