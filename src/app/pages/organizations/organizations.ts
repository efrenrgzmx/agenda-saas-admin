import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Organization, Pagination } from '../../core/models';

@Component({
  selector: 'app-organizations',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './organizations.html',
  styleUrl: './organizations.scss',
})
export class OrganizationsComponent implements OnInit {
  private apiService = inject(ApiService);

  organizations = signal<Organization[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  search = '';
  statusFilter = '';
  currentPage = 1;

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: Record<string, string | number> = {
      page: this.currentPage,
      limit: 20,
    };

    if (this.search) params['search'] = this.search;
    if (this.statusFilter) params['status'] = this.statusFilter;

    this.apiService.getOrganizations(params).subscribe({
      next: (response) => {
        if (response.success) {
          this.organizations.set(response.data);
          this.pagination.set(response.meta.pagination);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al cargar organizaciones');
        this.loading.set(false);
      },
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadOrganizations();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadOrganizations();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadOrganizations();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'active':
        return 'badge--success';
      case 'suspended':
        return 'badge--warning';
      case 'banned':
        return 'badge--danger';
      default:
        return 'badge--secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'suspended':
        return 'Suspendida';
      case 'banned':
        return 'Baneada';
      default:
        return status;
    }
  }
}
