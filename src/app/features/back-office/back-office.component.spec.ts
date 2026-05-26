import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
<<<<<<< HEAD
import { NO_ERRORS_SCHEMA } from '@angular/core';
=======
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
>>>>>>> origin/frontVersion1

=======
import { NO_ERRORS_SCHEMA } from '@angular/core';
>>>>>>> aziz
import { BackOfficeComponent } from './back-office.component';
import { TestingModule } from '../../testing/testing.module';

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('BackOfficeComponent', () => {
  let component: BackOfficeComponent;
  let fixture: ComponentFixture<BackOfficeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
<<<<<<< HEAD
<<<<<<< HEAD
      declarations: [BackOfficeComponent],
      schemas: [NO_ERRORS_SCHEMA]
=======

      imports: [RouterTestingModule],
      declarations: [BackOfficeComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]

>>>>>>> origin/frontVersion1
=======
      declarations: [BackOfficeComponent],
      imports: [TestingModule],
      schemas: [NO_ERRORS_SCHEMA]
>>>>>>> aziz
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