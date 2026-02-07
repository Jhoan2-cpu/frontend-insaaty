import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  currentLang = 'es';

  // Validation state
  emailTouched = false;
  passwordTouched = false;

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'es';
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
    // TODO: Implement actual login logic with backend
    console.log('Login attempt:', { email: this.email });

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // TODO: Navigate to dashboard on success
    }, 1500);
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
