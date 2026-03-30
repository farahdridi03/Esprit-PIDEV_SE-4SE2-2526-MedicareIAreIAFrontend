import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NonPatientGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    // Récupérer l'utilisateur depuis le localStorage ou un service d'authentification
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // Vérifier si l'utilisateur est connecté
    if (!currentUser || !currentUser.token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Vérifier si l'utilisateur n'est pas un patient
    // Les rôles autorisés: ADMIN, DOCTOR, NURSE, NUTRITIONIST, PHARMACIST
    const allowedRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'NUTRITIONIST', 'PHARMACIST'];
    const rawRole = currentUser.role || '';
    const userRole = rawRole.toUpperCase().replace(/^ROLE_/, '');
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Rediriger vers la page d'accueil par défaut si accès refusé
      this.router.navigate(['/front']);
      return false;
    }

    return true;
  }
}
