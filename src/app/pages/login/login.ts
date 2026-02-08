import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';

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
    private router: Router
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

    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Login error:', error);
          this.errorMessage = error.error?.message || 'Credenciales incorrectas';
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
