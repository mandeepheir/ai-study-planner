import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { Auth } from '@angular/fire/auth';

export const authGuard = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  const currentUser = auth.currentUser;

  if (currentUser) {
    return true;
  }

  return router.createUrlTree(['/login']);
};