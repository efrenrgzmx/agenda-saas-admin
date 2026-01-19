// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    admin: Admin;
    token: string;
  };
}

export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'support';
  created_at: string;
  updated_at: string;
}

// Dashboard
export interface DashboardStats {
  organizations: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    new_this_month: number;
  };
  users: {
    total: number;
    new_this_month: number;
  };
  appointments: {
    total: number;
    this_month: number;
  };
}

// Organization
export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'suspended' | 'banned';
  created_at: string;
  updated_at: string;
  owner?: User;
  members_count?: number;
  services_count?: number;
  appointments_count?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    pagination: Pagination;
  };
}

export type OrganizationListResponse = PaginatedResponse<Organization>;

// La respuesta del detalle incluye todo en data directamente
export interface OrganizationDetailData extends Organization {
  members: OrganizationMember[];
  statusHistory: StatusHistoryEntry[];
  stats: {
    memberCount: number;
    serviceCount: number;
    customerCount: number;
    totalAppointments: number;
    completedAppointments: number;
  };
}

export interface OrganizationDetailResponse {
  success: boolean;
  data: OrganizationDetailData;
}

export interface StatusHistoryEntry {
  id: string;
  status: string;
  reason?: string;
  changed_by: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'worker';
  isActive: number;
  createdAt: string;
}

// User
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar_url?: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export type UserListResponse = PaginatedResponse<User>;

export interface UserDetailResponse {
  success: boolean;
  data: {
    user: User;
    organizations: {
      organization: Organization;
      role: string;
    }[];
  };
}

// Service
export interface Service {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

// Admin
export interface AdminListResponse {
  success: boolean;
  data: Admin[];
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'support';
}

// Settings
export interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  updated_at: string;
}

export interface SettingsResponse {
  success: boolean;
  data: SystemSetting[];
}

// Audit Log
export interface AuditLogEntry {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export type AuditLogResponse = PaginatedResponse<AuditLogEntry>;

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
