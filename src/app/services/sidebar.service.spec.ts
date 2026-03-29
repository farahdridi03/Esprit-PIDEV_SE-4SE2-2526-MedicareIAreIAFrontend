import { TestBed } from '@angular/core/testing';
import { SidebarService } from './sidebar.service';

describe('SidebarService', () => {
  let service: SidebarService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SidebarService]
    });
    service = TestBed.inject(SidebarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with isCollapsed as false', () => {
    expect(service.isCollapsed()).toBeFalse();
  });

  it('should toggle isCollapsed status', () => {
    service.toggle();
    expect(service.isCollapsed()).toBeTrue();
    service.toggle();
    expect(service.isCollapsed()).toBeFalse();
  });

  it('should emit new state through isCollapsed$', (done) => {
    service.isCollapsed$.subscribe(collapsed => {
      // should emit twice: initially false, then true after toggle
      if (collapsed) {
        expect(collapsed).toBeTrue();
        done();
      }
    });
    service.toggle();
  });
});
