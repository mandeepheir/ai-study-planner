import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore } from '@angular/fire/firestore';
import { provideAuth } from '@angular/fire/auth';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import { firebaseConfig } from './firebase.config';


export const appConfig: ApplicationConfig = {

  providers: [

    provideBrowserGlobalErrorListeners(),

    provideZoneChangeDetection({
      eventCoalescing: true
    }),

    provideRouter(routes),

    // Initialize Firebase
    provideFirebaseApp(() =>
      initializeApp(firebaseConfig)
    ),

    // Enable Firestore
    provideFirestore(() =>
      getFirestore()
    ),

    // Enable Firebase Authentication
    provideAuth(() =>
      getAuth()
    )

  ]

};