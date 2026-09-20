import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Planner } from './pages/planner/planner';
import { Dashboard } from './pages/dashboard/dashboard';
import { Progress } from './pages/progress/progress';
import { AiSuggestion } from './pages/ai-suggestion/ai-suggestion';

import { Signup } from './components/signup/signup';
import { Login } from './components/login/login';

import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [

  // Public page
  {
    path: '',
    component: Home
  },

  // Authentication pages
  {
    path: 'signup',
    component: Signup,
    canActivate: [guestGuard]
  },

  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },

  // Protected pages
  {
    path: 'planner',
    component: Planner,
    canActivate: [authGuard]
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },

  {
    path: 'progress',
    component: Progress,
    canActivate: [authGuard]
  },

  {
    path: 'ai',
    component: AiSuggestion,
    canActivate: [authGuard]
  },

  // Redirect unknown URLs to Home
  {
    path: '**',
    redirectTo: ''
  }

];