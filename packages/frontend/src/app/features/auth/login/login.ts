import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  email = '';
  password = '';
  mode = signal<'signIn' | 'signUp'>('signIn');
  error = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  toggleMode() {
    this.mode.set(this.mode() === 'signIn' ? 'signUp' : 'signIn');
    this.error.set(null);
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  async submit() {
    this.error.set(null);
    this.loading.set(true);

    const { error } =
      this.mode() === 'signIn'
        ? await this.authService.signIn(this.email, this.password)
        : await this.authService.signUp(this.email, this.password);

    this.loading.set(false);

    if (error) {
      this.error.set(error.message);
      return;
    }

    if (this.mode() === 'signUp') {
      this.error.set(
        'Cuenta creada. Revisa tu correo si Supabase pide confirmación, o inicia sesión directamente.',
      );
      this.mode.set('signIn');
      return;
    }

    this.router.navigateByUrl('/');
  }
}
