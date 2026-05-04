import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const role = route.data['role'];

    if (role === 'admin') {
      const user = localStorage.getItem('user');
      if (!user) { this.router.navigate(['/admin']); return false; }
    }
    else if (role === 'administration') {
      const user = localStorage.getItem('administration');
      if (!user) { this.router.navigate(['/login-adminis']); return false; }
    }
    else if (role === 'professeur') {
      const user = localStorage.getItem('professeur');
      if (!user) { this.router.navigate(['/login-professeur']); return false; }
    }
    else if (role === 'etudiant') {
      const user = localStorage.getItem('etudiant');
      if (!user) { this.router.navigate(['/login-etudiant']); return false; }
    }

    return true;
  }
}