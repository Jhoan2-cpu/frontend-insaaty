import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { TitleService } from '../../services/title.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  activeTab: 'profile' | 'security' | 'company' = 'profile';

  profileForm: FormGroup;
  passwordForm: FormGroup;
  companyForm: FormGroup;

  loading = false;
  user: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef,
    private titleService: TitleService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      bio: ['']
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      nif: [''],
      address: [''],
      website: [''],
      currency: ['EUR'],
      timezone: ['Europe/Madrid'],
      multiWarehouse: [false]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  loadProfile() {
    this.loading = true;
    this.cdr.detectChanges();

    this.authService.getProfile(true)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (user) => {
          this.user = user;
          this.patchProfileForm(user);
        },
        error: (err) => {
          console.error('Error loading profile:', err);
          this.toast.error('Error loading profile');
        }
      });
  }

  private patchProfileForm(user: any) {
    this.profileForm.patchValue({
      fullName: user.full_name,
      email: user.email,
      bio: user.bio || ''
    });
    this.profileForm.markAsPristine();
    this.profileForm.markAsUntouched();
  }

  discardChanges() {
    if (this.user) {
      this.patchProfileForm(this.user);
      this.toast.success(this.translate.instant('SETTINGS.CHANGES_DISCARDED'));
    }
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.updateProfile(this.profileForm.value)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.user = { ...this.user, ...res };
          this.profileForm.markAsPristine();
          this.toast.success(this.translate.instant('SETTINGS.PROFILE_UPDATED'));
        },
        error: (err) => {
          this.toast.error('Error updating profile');
        }
      });
  }

  updatePassword() {
    if (this.passwordForm.invalid) return;

    const payload = { password: this.passwordForm.value.password };

    this.loading = true;
    this.cdr.detectChanges();

    this.authService.updateProfile(payload)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.toast.success(this.translate.instant('SETTINGS.SECURITY.PASSWORD_UPDATED'));
          this.passwordForm.reset();
        },
        error: (err) => {
          this.toast.error('Error updating password');
        }
      });
  }

  updateCompany() {
    if (this.companyForm.invalid) return;

    this.loading = true;
    this.authService.updateTenant(this.companyForm.value)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.toast.success('Company settings updated');
        },
        error: (err) => {
          this.toast.error('Error updating company');
        }
      });
  }
}
