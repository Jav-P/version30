import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  get email() {
    return this.authService.session()?.user.email;
  }

  async logout() {
    await this.authService.signOut();
    this.router.navigateByUrl('/login');
  }
}
