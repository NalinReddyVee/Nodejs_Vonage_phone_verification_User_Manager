import { NgIf } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize, interval, Subscription } from 'rxjs';

@Component({
    selector     : 'auth-confirmation-required',
    templateUrl  : './confirmation-required.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [NgIf, FuseAlertComponent, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatProgressSpinnerModule, RouterLink],
})
export class AuthConfirmationRequiredComponent
{
    confirmCodeForm: FormGroup;
    showAlert: boolean;
    alert: { type: string; message: string; };
    isResendDisabled: boolean = true; // Disable resend initially
    countdown: number = 120; // 2 minutes countdown
    countdownSubscription: Subscription;

    /**
     * Constructor
     */

    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private router: Router,
        private _activatedRoute: ActivatedRoute
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Create the form
        this.confirmCodeForm = this._formBuilder.group({
            code: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
        });
        this._authService.check().subscribe(authenticated => {
            if (authenticated && this._authService.isPhoneVerified) {
                const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';
                console.log("verified!!!!!!!!!!!!!!!!")
                // Navigate to the redirect url
                this.router.navigateByUrl(redirectURL);
             } else {
                 // Send the verification code to the user phone number.
                this.sendCode();
             }
        });
    }

    get ctrls() {
        return this.confirmCodeForm.controls;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    /**
     * Verify the Code
     */
    submit(): void
    {
        // Return if the form is invalid
        if ( this.confirmCodeForm.invalid )
        {
            return;
        }

        // Disable the form
        this.confirmCodeForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Forgot password
        this._authService.verifyCode(+this.confirmCodeForm.get('code').value)
            .pipe(
                finalize(() =>
                {
                    // Re-enable the form
                    this.confirmCodeForm.enable();

                    // Reset the form
                    this.confirmCodeForm.reset();

                    // Show the alert
                    this.showAlert = true;

                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                    // Navigate to the redirect url
                    this.router.navigateByUrl(redirectURL);
                }),
            )
            .subscribe(
                (response) =>
                {
                    // Set the alert
                    this.alert = {
                        type   : 'success',
                        message: 'Verification success! Please login.',
                    };
                    this.router.navigate(['']);
                },
                (response) =>
                {
                    const errorMsg = response?.error?.message ? response?.error?.message : response.error;
                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: errorMsg ? errorMsg : 'User does not found! Are you sure you are already a member?',
                    };
                },
            );
    }


    /**
     * Send the Code
     */
    sendCode(): void
    {

        // Hide the alert
        this.showAlert = false;

        // Forgot password
        this._authService.sendCode()
            .pipe(
                finalize(() =>
                {

                    // Reset the form
                    this.confirmCodeForm.reset();

                    // Show the alert
                    this.showAlert = true;

                    // Restart the timer after sending the code
                    this.startResendTimer(); 

                }),
            )
            .subscribe(
                (response) =>
                {
                    // Set the alert
                    this.alert = {
                        type   : 'success',
                        message: 'Code sent to your Phone number! You\'ll receive code if you are registered on our system.',
                    };
                },
                (response) =>
                {
                    const errorMsg = response?.error?.message ? response?.error?.message : response.error;
                    // Set the alert
                    this.alert = {
                        type   : 'error',
                        message: errorMsg ? errorMsg : 'User does not found! Are you sure you are already a member?',
                    };
                },
            );
    }

    startResendTimer(): void {
        this.isResendDisabled = true; // Disable the resend button
        this.countdown = 120; // Reset countdown to 2 minutes

        // If there's an existing subscription, unsubscribe to avoid multiple timers
        if (this.countdownSubscription) {
            this.countdownSubscription.unsubscribe();
        }

        // Start an interval
        this.countdownSubscription = interval(1000).subscribe(() => {
            this.countdown--;

            // If countdown reaches zero, enable the resend button and stop the timer
            if (this.countdown === 0) {
                this.isResendDisabled = false;
                this.countdownSubscription.unsubscribe();
            }
        });
    }

}
