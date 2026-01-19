import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error.set('Por favor ingresa email y contraseña');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.apiService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.loading.set(false);
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.error?.message || 'Error al iniciar sesion');
      },
    });
  }
}
