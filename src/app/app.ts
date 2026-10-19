
import { Component, OnInit, inject } from '@angular/core';
import {CommonModule} from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'ai-study-planner';

  private firebaseService = inject(FirebaseService);

  authTestMessage = 'Testing backend authentication...';
  authTestSuccess = false;

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.firebaseService.testBackendAuth();

      this.authTestMessage =
        `${result.message} User ID: ${result.uid}`;

      this.authTestSuccess = true;
      console.log('Backend authentication successful:', result);
    } catch (error) {
      this.authTestMessage =
        error instanceof Error
          ? error.message
          : 'Backend authentication test failed.';

      this.authTestSuccess = false;
      console.error('Backend authentication failed:', error);
    }
  }
}
