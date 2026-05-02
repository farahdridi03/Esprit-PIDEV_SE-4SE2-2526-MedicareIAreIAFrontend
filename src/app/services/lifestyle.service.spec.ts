import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LifestyleService } from './lifestyle.service';
import { MOCK_GOALS, MOCK_PLANS, MOCK_TRACKINGS } from '../testing/mocks/lifestyle.mock';

describe('LifestyleService', () => {
  let service: LifestyleService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8081/springsecurity/api';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LifestyleService]
    });
    service = TestBed.inject(LifestyleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Goals', () => {
    it('should fetch all goals', () => {
      service.getGoals().subscribe(goals => {
        expect(goals.length).toBe(2);
        expect(goals).toEqual(MOCK_GOALS);
      });

      const req = httpMock.expectOne(`${baseUrl}/lifestyle-goals`);
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_GOALS);
    });

    it('should add a new goal', () => {
      const newGoal = MOCK_GOALS[0];
      service.addGoal(newGoal).subscribe(goal => {
        expect(goal).toEqual(newGoal);
      });

      const req = httpMock.expectOne(`${baseUrl}/lifestyle-goals`);
      expect(req.request.method).toBe('POST');
      req.flush(newGoal);
    });
  });

  describe('Plans', () => {
    it('should fetch plans by patientId', () => {
      const patientId = 101;
      service.getPlansByPatientId(patientId).subscribe(plans => {
        expect(plans).toEqual(MOCK_PLANS);
      });

      const req = httpMock.expectOne(`${baseUrl}/lifestyle-plans/patient/${patientId}`);
      expect(req.request.method).toBe('GET');
      req.flush(MOCK_PLANS);
    });
  });

  describe('Tracking', () => {
    it('should fetch tracking data by patientId', () => {
        const patientId = 101;
        service.getTrackingsByPatientId(patientId).subscribe(trackings => {
          expect(trackings).toEqual(MOCK_TRACKINGS);
        });
  
        const req = httpMock.expectOne(`${baseUrl}/progress-tracking/patient/${patientId}`);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_TRACKINGS);
      });
  })
});
