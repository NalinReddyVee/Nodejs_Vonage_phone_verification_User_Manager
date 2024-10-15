import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, map } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);
    const authService = inject(AuthService);

    // Check the authentication status
    return authService.check().pipe(
        map((authenticated) => {
            console.log(authenticated, "from guard");

            // If the user is not authenticated...
            if (!authenticated) {
                // Redirect to the sign-in page with a redirectUrl param
                const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                const urlTree = router.parseUrl(`sign-in?${redirectURL}`);
                console.log(urlTree);
                return urlTree;
            }

            // If the user is authenticated but the phone number is not verified...
            if (!authService.isPhoneVerified) {
                // Redirect to the confirmation-required page
                const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
                const urlTree = router.parseUrl(`confirmation-required?${redirectURL}`);
                console.log(urlTree);
                return urlTree;
            }

            // Allow the access if authenticated and phone number is verified
            return true;
        })
    );
};
