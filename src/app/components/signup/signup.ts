import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  email = '';
  password = '';

  message = '';
  errorMessage = '';

  constructor(
    private authService: AuthService
  ) {}


  signup(): void {

    this.message = '';
    this.errorMessage = '';


    if (!this.email || !this.password) {

      this.errorMessage =
        'Please enter your email and password.';

      return;
    }


    if (this.password.length < 6) {

      this.errorMessage =
        'Password must be at least 6 characters.';

      return;
    }


    this.authService
      .register(
        this.email,
        this.password
      )

      .then(() => {

        this.message =
          'Account created successfully!';

        this.email = '';
        this.password = '';

      })

      .catch((error) => {

        console.error(
          'Signup failed:',
          error
        );


        if (error.code === 'auth/email-already-in-use') {

          this.errorMessage =
            'An account with this email already exists.';

        } else if (error.code === 'auth/invalid-email') {

          this.errorMessage =
            'Please enter a valid email address.';

        } else {

          this.errorMessage =
            'Signup failed. Please try again.';

        }

      });

  }

}