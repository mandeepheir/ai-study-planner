import { inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  Auth,
  onAuthStateChanged
} from '@angular/fire/auth';

export const guestGuard = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  return new Promise<boolean | ReturnType<Router['createUrlTree']>>(
    (resolve) => {

      onAuthStateChanged(
        auth,
        (user) => {

          if (user) {

            resolve(
              router.createUrlTree(['/planner'])
            );

          } else {

            resolve(true);

          }

        },
        () => {

          resolve(true);

        }
      );

    }
  );
};