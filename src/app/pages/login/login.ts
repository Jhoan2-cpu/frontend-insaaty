import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  currentLang = 'es';
  errorMessage = '';

  // Validation state
  emailTouched = false;
  passwordTouched = false;

  constructor(
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    // Ensure translation is initialized
    this.translate.setDefaultLang('es');
    const savedLang = this.translate.currentLang || 'es';
    this.translate.use(savedLang);
    this.currentLang = savedLang;
  }

  get emailError(): string | null {
    if (!this.emailTouched) return null;
    if (!this.email) return 'LOGIN.EMAIL_REQUIRED';
    if (!this.isValidEmail(this.email)) return 'LOGIN.EMAIL_INVALID';
    return null;
  }

  get passwordError(): string | null {
    if (!this.passwordTouched) return null;
    if (!this.password) return 'LOGIN.PASSWORD_REQUIRED';
    if (this.password.length < 6) return 'LOGIN.PASSWORD_MIN';
    return null;
  }

  get isFormValid(): boolean {
    return this.isValidEmail(this.email) && this.password.length >= 6;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
  }

  onSubmit() {
    this.emailTouched = true;
    this.passwordTouched = true;

    if (!this.isFormValid) return;

    this.isLoading = true;
    this.errorMessage = '';
    console.log('Attempting login...');

    this.authService.login({ email: this.email, password: this.password })
      .pipe(
        timeout(10000),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges(); // Force update
          console.log('Login request finalized. isLoading:', this.isLoading);
        })
      )
      .subscribe({
        next: () => {
          console.log('Login successful');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          if (error.name === 'TimeoutError') {
            this.errorMessage = 'LOGIN.ERROR_TIMEOUT';
          } else if (error.status === 401 || error.status === 404) {
            this.errorMessage = 'LOGIN.ERROR_CREDENTIALS';
          } else {
            this.errorMessage = 'LOGIN.ERROR_CREDENTIALS';
          }
          console.log('Error message set to:', this.errorMessage);
          this.cdr.detectChanges(); // Force update again
        }
      });
  }

  loginWithGoogle() {
    console.log('Login with Google');
    // TODO: Implement Google OAuth
  }

  loginWithSSO() {
    console.log('Login with SSO');
    // TODO: Implement SSO
  }
}
