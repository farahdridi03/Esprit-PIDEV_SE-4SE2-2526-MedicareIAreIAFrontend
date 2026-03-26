import { TestBed } from '@angular/core/testing';

import { LabRequestService } from './lab-request.service';

describe('LabRequestService', () => {
  let service: LabRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
