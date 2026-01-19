import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { UserDetailData, UserMembership } from '../../core/models';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  user = signal<UserDetailData | null>(null);
  memberships = signal<UserMembership[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  updating = signal(false);

  // Modal de suspender/activar
  showStatusModal = signal(false);
  newIsActive = true;
  statusReason = '';

  // Impersonar
  impersonating = signal(false);

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
  }

  loadUser(userId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getUser(userId).subscribe({
      next: (response) => {
        if (response.success) {
          this.user.set(response.data);
          this.memberships.set(response.data.memberships || []);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al cargar usuario');
        this.loading.set(false);
      },
    });
  }

  getFullName(): string {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'owner':
        return 'Propietario';
      case 'admin':
        return 'Administrador';
      case 'worker':
        return 'Trabajador';
      default:
        return role;
    }
  }

  // Suspender/Activar usuario
  openStatusModal(): void {
    const u = this.user();
    if (!u) return;
    this.newIsActive = u.isActive !== false;
    this.statusReason = '';
    this.showStatusModal.set(true);
  }

  closeStatusModal(): void {
    this.showStatusModal.set(false);
  }

  updateStatus(): void {
    const u = this.user();
    if (!u) return;

    this.updating.set(true);

    this.apiService.updateUserStatus(u.id, this.newIsActive, this.statusReason).subscribe({
      next: () => {
        this.user.update((user) => user ? { ...user, isActive: this.newIsActive } : null);
        this.closeStatusModal();
        this.updating.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al actualizar estado');
        this.updating.set(false);
      },
    });
  }

  // Impersonar usuario
  impersonateUser(): void {
    const u = this.user();
    if (!u) return;

    this.impersonating.set(true);

    this.apiService.impersonateUser(u.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Abrir una nueva ventana/pestaña con el token de impersonación
          // En un caso real, esto redireccionaría a la app del usuario
          const token = response.data.token;
          alert(`Token de impersonación generado para ${response.data.user.email}.\n\nEste token expira en 1 hora y todas las acciones serán registradas.`);
          console.log('Impersonation token:', token);
        }
        this.impersonating.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al impersonar usuario');
        this.impersonating.set(false);
      },
    });
  }

  isUserActive(): boolean {
    return this.user()?.isActive !== false;
  }
}
