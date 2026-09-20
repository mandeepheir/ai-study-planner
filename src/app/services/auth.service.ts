import { Injectable, inject } from '@angular/core';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth = inject(Auth);

  // Current logged-in user
  currentUser: User | null = null;


  constructor() {

    // Watch authentication state
    onAuthStateChanged(
      this.auth,
      (user) => {

        this.currentUser = user;

        console.log(
          'Authentication state:',
          user
        );

      }
    );

  }


  // Create a new account
  register(
    email: string,
    password: string
  ) {

    return createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );

  }


  // Login
  login(
    email: string,
    password: string
  ) {

    return signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );

  }


  // Logout
  logout() {

    return signOut(
      this.auth
    );

  }

}