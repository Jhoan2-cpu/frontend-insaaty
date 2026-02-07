import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  businessName = '';
  email = '';
  password = '';
  termsAccepted = false;
  showPassword = false;
  isLoading = false;
  currentLang = 'es';

  // Validation state
  businessTouched = false;
  emailTouched = false;
  passwordTouched = false;
  termsTouched = false;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
    this.translate.setDefaultLang('es');
    const savedLang = this.translate.currentLang || 'es';
    this.translate.use(savedLang);
    this.currentLang = savedLang;
  }

  get businessError(): string | null {
    if (!this.businessTouched) return null;
    if (!this.businessName.trim()) return 'REGISTER.BUSINESS_REQUIRED';
    return null;
  }

  get emailError(): string | null {
    if (!this.emailTouched) return null;
    if (!this.email) return 'REGISTER.EMAIL_REQUIRED';
    if (!this.isValidEmail(this.email)) return 'REGISTER.EMAIL_INVALID';
    return null;
  }

  get passwordError(): string | null {
    if (!this.passwordTouched) return null;
    if (!this.password) return 'REGISTER.PASSWORD_REQUIRED';
    if (this.password.length < 8) return 'REGISTER.PASSWORD_MIN';
    return null;
  }

  get termsError(): string | null {
    if (!this.termsTouched) return null;
    if (!this.termsAccepted) return 'REGISTER.TERMS_REQUIRED';
    return null;
  }

  get isFormValid(): boolean {
    return this.businessName.trim().length > 0 &&
      this.isValidEmail(this.email) &&
      this.password.length >= 8 &&
      this.termsAccepted;
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
    this.businessTouched = true;
    this.emailTouched = true;
    this.passwordTouched = true;
    this.termsTouched = true;

    if (!this.isFormValid) return;

    this.isLoading = true;
    console.log('Register attempt:', {
      businessName: this.businessName,
      email: this.email
    });

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      // TODO: Navigate to dashboard on success
    }, 1500);
  }

  registerWithGoogle() {
    console.log('Register with Google');
    // TODO: Implement Google OAuth
  }

  registerWithMicrosoft() {
    console.log('Register with Microsoft');
    // TODO: Implement Microsoft OAuth
  }
}
