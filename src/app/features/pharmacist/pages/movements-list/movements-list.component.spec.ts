import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MovementsListComponent } from './movements-list.component';

describe('MovementsListComponent', () => {
  let component: MovementsListComponent;
  let fixture: ComponentFixture<MovementsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [MovementsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovementsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
