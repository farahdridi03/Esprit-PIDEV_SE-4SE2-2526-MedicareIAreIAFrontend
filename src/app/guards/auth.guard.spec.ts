import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getUserRole']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: spy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if user is authenticated and no roles are required', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue('PATIENT');

    const route = { data: { roles: [] } } as any as ActivatedRouteSnapshot;
    const state = { url: '/test' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);
    expect(result).toBeTrue();
  });

  it('should return true if user has required role', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue('ADMIN');

    const route = { data: { roles: ['ADMIN', 'PHARMACIST'] } } as any as ActivatedRouteSnapshot;
    const state = { url: '/admin' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);
    expect(result).toBeTrue();
  });

  it('should return UrlTree to login if user is not authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const tree = router.parseUrl('/auth/login?returnUrl=/test');
    spyOn(router, 'createUrlTree').and.returnValue(tree);

    const route = { data: { roles: [] } } as any as ActivatedRouteSnapshot;
    const state = { url: '/test' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);
    expect(result).toEqual(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], { queryParams: { returnUrl: '/test' } });
  });

  it('should return UrlTree to login if user has wrong role', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue('PATIENT');
    const tree = router.parseUrl('/auth/login');
    spyOn(router, 'createUrlTree').and.returnValue(tree);

    const route = { data: { roles: ['ADMIN'] } } as any as ActivatedRouteSnapshot;
    const state = { url: '/admin' } as RouterStateSnapshot;

    const result = guard.canActivate(route, state);
    expect(result).toEqual(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
  });
});
