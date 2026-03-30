import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
<<<<<<< HEAD
import { NO_ERRORS_SCHEMA } from '@angular/core';
=======
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
>>>>>>> origin/frontVersion1

import { FrontLayoutComponent } from './front-layout.component';

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FrontLayoutComponent', () => {
  let component: FrontLayoutComponent;
  let fixture: ComponentFixture<FrontLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
<<<<<<< HEAD
      declarations: [FrontLayoutComponent],
      schemas: [NO_ERRORS_SCHEMA]
=======

      imports: [RouterTestingModule],
      declarations: [FrontLayoutComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
>>>>>>> origin/frontVersion1
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
