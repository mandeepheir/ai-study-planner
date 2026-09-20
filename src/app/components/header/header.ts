import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

  isDarkMode = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  toggleDarkMode(): void {

    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {

      document.body.classList.add('dark-mode');

    } else {

      document.body.classList.remove('dark-mode');

    }

  }

  logout(): void {

    this.authService
      .logout()
      .then(() => {

        console.log(
          'User logged out successfully.'
        );

        this.router.navigate(['/login']);

      })
      .catch((error) => {

        console.error(
          'Logout failed:',
          error
        );

      });

  }

}