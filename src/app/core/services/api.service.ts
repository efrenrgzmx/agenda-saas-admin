import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import {
  LoginRequest,
  LoginResponse,
  Admin,
  DashboardStats,
  OrganizationListResponse,
  OrganizationDetailResponse,
  UserListResponse,
  UserDetailResponse,
  AdminListResponse,
  CreateAdminRequest,
  SettingsResponse,
  AuditLogResponse,
  ApiResponse,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = environment.apiUrl;

  // Auth
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.success) {
          this.authService.setAuth(response.data.token, response.data.admin);
        }
      })
    );
  }

  logout(): void {
    this.authService.clearAuth();
  }

  getMe(): Observable<ApiResponse<{ admin: Admin }>> {
    return this.http.get<ApiResponse<{ admin: Admin }>>(`${this.baseUrl}/me`);
  }

  // Dashboard
  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/dashboard/stats`);
  }

  // Organizations
  getOrganizations(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Observable<OrganizationListResponse> {
    return this.http.get<OrganizationListResponse>(`${this.baseUrl}/organizations`, { params });
  }

  getOrganization(orgId: string): Observable<OrganizationDetailResponse> {
    return this.http.get<OrganizationDetailResponse>(`${this.baseUrl}/organizations/${orgId}`);
  }

  updateOrganizationStatus(
    orgId: string,
    status: 'active' | 'suspended' | 'banned',
    reason?: string
  ): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/organizations/${orgId}/status`, {
      status,
      reason,
    });
  }

  // Users
  getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(`${this.baseUrl}/users`, { params });
  }

  getUser(userId: string): Observable<UserDetailResponse> {
    return this.http.get<UserDetailResponse>(`${this.baseUrl}/users/${userId}`);
  }

  // Admins (super_admin only)
  getAdmins(): Observable<AdminListResponse> {
    return this.http.get<AdminListResponse>(`${this.baseUrl}/admins`);
  }

  createAdmin(data: CreateAdminRequest): Observable<ApiResponse<{ admin: Admin }>> {
    return this.http.post<ApiResponse<{ admin: Admin }>>(`${this.baseUrl}/admins`, data);
  }

  updateAdmin(
    adminId: string,
    data: Partial<CreateAdminRequest>
  ): Observable<ApiResponse<{ admin: Admin }>> {
    return this.http.put<ApiResponse<{ admin: Admin }>>(`${this.baseUrl}/admins/${adminId}`, data);
  }

  // Settings (super_admin only)
  getSettings(): Observable<SettingsResponse> {
    return this.http.get<SettingsResponse>(`${this.baseUrl}/settings`);
  }

  updateSetting(key: string, value: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/settings/${key}`, { value });
  }

  // Audit Log
  getAuditLog(params?: { page?: number; limit?: number }): Observable<AuditLogResponse> {
    return this.http.get<AuditLogResponse>(`${this.baseUrl}/audit-log`, { params });
  }
}
