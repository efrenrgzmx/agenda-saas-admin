import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Admin } from '../models';

const TOKEN_KEY = 'admin_token';
const ADMIN_KEY = 'admin_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private adminSignal = signal<Admin | null>(null);
  private tokenSignal = signal<string | null>(null);

  admin = this.adminSignal.asReadonly();
  token = this.tokenSignal.asReadonly();
  isAuthenticated = computed(() => !!this.tokenSignal());
  isSuperAdmin = computed(() => this.adminSignal()?.role === 'super_admin');

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem(TOKEN_KEY);
    const adminStr = localStorage.getItem(ADMIN_KEY);

    if (token && adminStr) {
      try {
        const admin = JSON.parse(adminStr) as Admin;
        this.tokenSignal.set(token);
        this.adminSignal.set(admin);
      } catch {
        this.clearAuth();
      }
    }
  }

  setAuth(token: string, admin: Admin): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
    }
    this.tokenSignal.set(token);
    this.adminSignal.set(admin);
  }

  clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ADMIN_KEY);
    }
    this.tokenSignal.set(null);
    this.adminSignal.set(null);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}
