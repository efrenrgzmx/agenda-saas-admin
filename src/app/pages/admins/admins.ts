import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Admin } from '../../core/models';

@Component({
  selector: 'app-admins',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './admins.html',
  styleUrl: './admins.scss',
})
export class AdminsComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);

  admins = signal<Admin[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  showModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingAdmin = signal<Admin | null>(null);
  saving = signal(false);

  // Modal de eliminar
  showDeleteModal = signal(false);
  deletingAdmin = signal<Admin | null>(null);
  deleting = signal(false);

  formName = '';
  formEmail = '';
  formPassword = '';
  formRole: 'super_admin' | 'support' = 'support';
  formIsActive = true;

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getAdmins().subscribe({
      next: (response) => {
        if (response.success) {
          this.admins.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al cargar administradores');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(): void {
    this.modalMode.set('create');
    this.editingAdmin.set(null);
    this.formName = '';
    this.formEmail = '';
    this.formPassword = '';
    this.formRole = 'support';
    this.showModal.set(true);
  }

  openEditModal(admin: Admin): void {
    this.modalMode.set('edit');
    this.editingAdmin.set(admin);
    this.formName = admin.name;
    this.formEmail = admin.email;
    this.formPassword = '';
    this.formRole = admin.role;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveAdmin(): void {
    if (!this.formName || !this.formEmail) return;

    this.saving.set(true);

    if (this.modalMode() === 'create') {
      if (!this.formPassword) {
        this.saving.set(false);
        return;
      }

      this.apiService
        .createAdmin({
          name: this.formName,
          email: this.formEmail,
          password: this.formPassword,
          role: this.formRole,
        })
        .subscribe({
          next: () => {
            this.loadAdmins();
            this.closeModal();
            this.saving.set(false);
          },
          error: (err) => {
            this.error.set(err.error?.error?.message || 'Error al crear administrador');
            this.saving.set(false);
          },
        });
    } else {
      const admin = this.editingAdmin();
      if (!admin) return;

      const data: Partial<{ name: string; email: string; password: string; role: 'super_admin' | 'support' }> = {
        name: this.formName,
        email: this.formEmail,
        role: this.formRole,
      };

      if (this.formPassword) {
        data.password = this.formPassword;
      }

      this.apiService.updateAdmin(admin.id, data).subscribe({
        next: () => {
          this.loadAdmins();
          this.closeModal();
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.error?.message || 'Error al actualizar administrador');
          this.saving.set(false);
        },
      });
    }
  }

  getRoleLabel(role: string): string {
    return role === 'super_admin' ? 'Super Admin' : 'Soporte';
  }

  // Eliminar admin
  openDeleteModal(admin: Admin): void {
    // No permitir eliminar al usuario actual
    const currentAdmin = this.authService.admin();
    if (currentAdmin && currentAdmin.id === admin.id) {
      this.error.set('No puedes eliminar tu propia cuenta');
      return;
    }
    this.deletingAdmin.set(admin);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.deletingAdmin.set(null);
  }

  deleteAdmin(): void {
    const admin = this.deletingAdmin();
    if (!admin) return;

    this.deleting.set(true);

    this.apiService.deleteAdmin(admin.id).subscribe({
      next: () => {
        this.loadAdmins();
        this.closeDeleteModal();
        this.deleting.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al eliminar administrador');
        this.deleting.set(false);
        this.closeDeleteModal();
      },
    });
  }

  isCurrentAdmin(admin: Admin): boolean {
    const currentAdmin = this.authService.admin();
    return currentAdmin ? currentAdmin.id === admin.id : false;
  }
}
