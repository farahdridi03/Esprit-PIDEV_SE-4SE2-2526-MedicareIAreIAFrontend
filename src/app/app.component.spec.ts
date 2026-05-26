<<<<<<< HEAD
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
=======
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
>>>>>>> aziz
import { AppComponent } from './app.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
<<<<<<< HEAD
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        HttpClientTestingModule, 
        RouterTestingModule
      ],
      declarations: [
        AppComponent
      ],
=======
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA]
>>>>>>> aziz
    }).compileComponents();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create the app', () => {
    fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have title 'MediCareAI'`, () => {
    fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('MediCareAI');
  });
<<<<<<< HEAD
=======

<<<<<<< HEAD

  it('should render a router-outlet', () => {
    const fixture = TestBed.createComponent(AppComponent);
=======
  it('should render router-outlet', () => {
    fixture = TestBed.createComponent(AppComponent);
>>>>>>> aziz
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

>>>>>>> origin/frontVersion1
});


