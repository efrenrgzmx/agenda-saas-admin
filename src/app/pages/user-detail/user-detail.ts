import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { User, Organization } from '../../core/models';

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

  user = signal<User | null>(null);
  organizations = signal<{ organization: Organization; role: string }[]>([]);
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
          this.user.set(response.data.user);
          this.organizations.set(response.data.organizations);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al cargar usuario');
        this.loading.set(false);
      },
    });
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
