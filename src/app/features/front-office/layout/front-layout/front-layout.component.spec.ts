import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FrontLayoutComponent } from './front-layout.component';

describe('FrontLayoutComponent', () => {
  let component: FrontLayoutComponent;
  let fixture: ComponentFixture<FrontLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [FrontLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrontLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
