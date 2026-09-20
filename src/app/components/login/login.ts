import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  message = '';
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login(): void {

    this.message = '';
    this.errorMessage = '';

    if (!this.email || !this.password) {

      this.errorMessage =
        'Please enter your email and password.';

      return;
    }

    this.authService
      .login(
        this.email,
        this.password
      )
      .then(() => {

        console.log(
          'Login successful!'
        );

        this.router.navigate(['/planner']);

      })
      .catch((error) => {

        console.error(
          'Login failed:',
          error
        );

        if (
          error.code ===
          'auth/invalid-credential'
        ) {

          this.errorMessage =
            'Incorrect email or password.';

        } else if (
          error.code ===
          'auth/invalid-email'
        ) {

          this.errorMessage =
            'Please enter a valid email address.';

        } else {

          this.errorMessage =
            'Login failed. Please try again.';

        }

      });
  }

}