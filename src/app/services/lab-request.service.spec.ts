import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LabRequestService } from './lab-request.service';

describe('LabRequestService', () => {
  let service: LabRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      imports: [HttpClientTestingModule, RouterTestingModule],});
    service = TestBed.inject(LabRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
