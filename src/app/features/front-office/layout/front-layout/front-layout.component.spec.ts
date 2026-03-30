import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { FrontLayoutComponent } from './front-layout.component';

describe('FrontLayoutComponent', () => {
  let component: FrontLayoutComponent;
  let fixture: ComponentFixture<FrontLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({

      imports: [RouterTestingModule],
      declarations: [FrontLayoutComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
