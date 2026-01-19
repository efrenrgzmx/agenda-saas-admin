import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En SSR, permitir acceso
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Verificar token directamente del localStorage como fallback
  const token = authService.getToken() || localStorage.getItem('admin_token');

  if (token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // En SSR, permitir acceso
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // Verificar token directamente del localStorage
  const token = authService.getToken() || localStorage.getItem('admin_token');

  if (!token) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

export const superAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isSuperAdmin()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
