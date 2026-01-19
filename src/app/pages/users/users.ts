import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { User, Pagination } from '../../core/models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent implements OnInit {
  private apiService = inject(ApiService);

  users = signal<User[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  search = '';
  currentPage = 1;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: Record<string, string | number> = {
      page: this.currentPage,
      limit: 20,
    };

    if (this.search) params['search'] = this.search;

    this.apiService.getUsers(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.users.set(response.data);
          this.pagination.set(response.meta.pagination);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }
}
