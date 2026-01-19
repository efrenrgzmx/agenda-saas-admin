import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { OrganizationDetailData, OrganizationMember, Organization } from '../../core/models';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe],
  templateUrl: './organization-detail.html',
  styleUrl: './organization-detail.scss',
})
export class OrganizationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  organization = signal<OrganizationDetailData | null>(null);
  members = signal<OrganizationMember[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);
  updating = signal(false);

  showStatusModal = signal(false);
  newStatus = '';
  statusReason = '';

  ngOnInit(): void {
    const orgId = this.route.snapshot.paramMap.get('id');
    if (orgId) {
      this.loadOrganization(orgId);
    }
  }

  loadOrganization(orgId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getOrganization(orgId).subscribe({
      next: (response) => {
        if (response.success) {
          this.organization.set(response.data);
          this.members.set(response.data.members || []);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al cargar organizacion');
        this.loading.set(false);
      },
    });
  }

  openStatusModal(): void {
    this.newStatus = this.organization()?.status || 'active';
    this.statusReason = '';
    this.showStatusModal.set(true);
  }

  closeStatusModal(): void {
    this.showStatusModal.set(false);
  }

  updateStatus(): void {
    const org = this.organization();
    if (!org || this.newStatus === org.status) {
      this.closeStatusModal();
      return;
    }

    this.updating.set(true);

    this.apiService
      .updateOrganizationStatus(org.id, this.newStatus as 'active' | 'suspended' | 'banned', this.statusReason)
      .subscribe({
        next: () => {
          this.organization.update((o) => (o ? { ...o, status: this.newStatus as Organization['status'] } : null));
          this.closeStatusModal();
          this.updating.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.error?.message || 'Error al actualizar estado');
          this.updating.set(false);
        },
      });
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
