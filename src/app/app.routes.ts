import { Routes } from '@angular/router';

import {Home} from './pages/home/home';
import { Planner } from './pages/planner/planner';
import { Dashboard } from './pages/dashboard/dashboard';
import { Progress } from './pages/progress/progress';
import {AiSuggestion} from './pages/ai-suggestion/ai-suggestion';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'planner', component: Planner },
  { path: 'dashboard', component: Dashboard },
  { path: 'progress', component: Progress },
  { path: 'ai', component: AiSuggestion },

  // Redirect unknown URLs to Home
  { path: '**', redirectTo: '' }
];