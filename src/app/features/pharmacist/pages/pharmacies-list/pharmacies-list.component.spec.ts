import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PharmaciesListComponent } from './pharmacies-list.component';

describe('PharmaciesListComponent', () => {
  let component: PharmaciesListComponent;
  let fixture: ComponentFixture<PharmaciesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
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
