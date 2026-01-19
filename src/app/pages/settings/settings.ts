import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SystemSetting } from '../../core/models';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent implements OnInit {
  private apiService = inject(ApiService);

  settings = signal<SystemSetting[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  showModal = signal(false);
  editingSetting = signal<SystemSetting | null>(null);
  saving = signal(false);
  formValue = '';

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService.getSettings().subscribe({
      next: (response) => {
        if (response.success) {
          this.settings.set(response.data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al cargar configuraciones');
        this.loading.set(false);
      },
    });
  }

  openEditModal(setting: SystemSetting): void {
    this.editingSetting.set(setting);
    this.formValue = setting.value;
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveSetting(): void {
    const setting = this.editingSetting();
    if (!setting) return;

    this.saving.set(true);

    this.apiService.updateSetting(setting.key, this.formValue).subscribe({
      next: () => {
        this.settings.update((settings) =>
          settings.map((s) => (s.key === setting.key ? { ...s, value: this.formValue } : s))
        );
        this.closeModal();
        this.saving.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.error?.message || 'Error al actualizar configuracion');
        this.saving.set(false);
      },
    });
  }
}
