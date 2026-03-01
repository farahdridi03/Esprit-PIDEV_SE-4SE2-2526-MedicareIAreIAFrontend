import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        if (this.authService.isAuthenticated()) {
            const requiredRoles = route.data['roles'] as Array<string>;
            const userRole = this.authService.getUserRole();

            console.log('AuthGuard - Required Roles:', requiredRoles);
            console.log('AuthGuard - User Role:', userRole);

            if (!requiredRoles || requiredRoles.length === 0) {
                return true;
            }

            if (userRole && requiredRoles.includes(userRole)) {
                return true;
            }

            console.warn('AuthGuard - Access denied: role mismatch');
            return this.router.createUrlTree(['/auth/login']);
        }

        // Not authenticated
        return this.router.createUrlTree(['/auth/login']);
    }
}
