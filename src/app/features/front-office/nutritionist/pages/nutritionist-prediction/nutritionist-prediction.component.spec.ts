import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionistPredictionComponent } from './nutritionist-prediction.component';

describe('NutritionistPredictionComponent', () => {
  let component: NutritionistPredictionComponent;
  let fixture: ComponentFixture<NutritionistPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NutritionistPredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionistPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
