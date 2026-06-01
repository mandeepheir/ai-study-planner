import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { PlannerComponent } from './pages/planner/planner';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ProgressComponent } from './pages/progress/progress';
import ProgressComponent from './pages/progress/progress';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'planner', component: PlannerComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'progress', component: ProgressComponent },
  { path: 'ai', component: AiSuggestionsComponent }
];