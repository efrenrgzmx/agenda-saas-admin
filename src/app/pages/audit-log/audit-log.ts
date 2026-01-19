import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuditLogEntry, Pagination } from '../../core/models';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './audit-log.html',
  styleUrl: './audit-log.scss',
})
export class AuditLogComponent implements OnInit {
  private apiService = inject(ApiService);

  logs = signal<AuditLogEntry[]>([]);
  pagination = signal<Pagination | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  currentPage = 1;

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getAuditLog({ page: this.currentPage, limit: 50 }).subscribe({
      next: (response) => {
        if (response.success) {
          this.logs.set(response.data);
          this.pagination.set(response.meta.pagination);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al cargar audit log');
        this.loading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadLogs();
  }

  getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      login: 'Inicio de sesion',
      'organization.status_change': 'Cambio estado org',
      'admin.create': 'Admin creado',
      'admin.update': 'Admin actualizado',
      'setting.update': 'Config actualizada',
    };
    return labels[action] || action;
  }
}
