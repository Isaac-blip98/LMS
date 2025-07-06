import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.hasToken()) {
      this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const requiredRole = route.data['role'];
    if (requiredRole && !this.authService.hasRole(requiredRole)) {
      if (this.authService.isAdmin()) {
        this.router.navigate(['/admin-dashboard']);
      } else if (this.authService.isInstructor()) {
        this.router.navigate(['/instructor/dashboard']);
      } else if (this.authService.isStudent()) {
        this.router.navigate(['/courses']);
      } else {
        this.router.navigate(['/']);
      }
      return false;
    }

    return true;
  }
}
