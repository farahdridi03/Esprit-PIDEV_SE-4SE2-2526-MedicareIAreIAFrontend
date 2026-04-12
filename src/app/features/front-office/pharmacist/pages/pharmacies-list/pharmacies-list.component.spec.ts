import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PharmaciesListComponent } from './pharmacies-list.component';

describe('PharmaciesListComponent', () => {
  let component: PharmaciesListComponent;
  let fixture: ComponentFixture<PharmaciesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PharmaciesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PharmaciesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
