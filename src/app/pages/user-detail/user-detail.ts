import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { UserDetailData, UserMembership } from '../../core/models';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
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
}
