import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BackOfficeComponent } from './back-office.component';
import { TestingModule } from '../../testing/testing.module';

describe('BackOfficeComponent', () => {
  let component: BackOfficeComponent;
  let fixture: ComponentFixture<BackOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackOfficeComponent],
      imports: [TestingModule],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(BackOfficeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
