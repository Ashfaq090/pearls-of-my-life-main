import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeyHolderService } from '../services/key-holder.service';
import { SharedService } from '../services/shared.service';
import { map, catchError, of } from 'rxjs';

// export const keyHolderGuard: CanActivateFn = (route, state) => {
//   const keyHolderService = inject(KeyHolderService);
//   const sharedService = inject(SharedService);
//   const router = inject(Router);

//   return keyHolderService.getKeyHolders().pipe(
//     map((response: any) => {
//       if (response && response.length > 0) {
//         return true;
//       }
//       sharedService.showToast({
//         classname: 'warning',
//         text: 'Please assign at least one key holder to access this feature.',
//       });
//       router.navigate(['/key-holders']);
//       return false;
//     }),
//     catchError(() => {
//       sharedService.showToast({
//         classname: 'error',
//         text: 'Error checking key holders. Please try again.',
//       });
//       return of(false);
//     })
//   );
// };
export const keyHolderGuard: CanActivateFn = (route, state) => {
  const keyHolderService = inject(KeyHolderService);
  const sharedService = inject(SharedService);
  const router = inject(Router);

  return keyHolderService.getKeyHolders().pipe(
    map((response: any) => {
      //debugger;
      console.log('Key holders response:', response); // Add logging for debugging

      // Handle different response structures
      const keyHolders = Array.isArray(response)
        ? response
        : response?.data || response?.keyHolders || response?.items || [];

      if (keyHolders.length > 0) {
        console.log('Key holders found:', keyHolders.length); // Debug logging
        return true;
      }

      console.warn('No key holders found'); // Debug logging
      sharedService.showToast({
        classname: 'warning',
        text: 'Please assign at least one key holder to access this feature.',
      });
      return router.parseUrl('/key-holders');

      // return false;
    }),
    catchError((error) => {
      console.error('Error checking key holders:', error); // Debug logging
      sharedService.showToast({
        classname: 'error',
        text: 'Error checking key holders. Please try again.',
      });
      return of(router.parseUrl('/key-holders'));
    })
  );
};
