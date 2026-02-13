import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
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
  uploadingAvatar = false;
  user: any = null;
  avatarBaseUrl = 'http://localhost:3000';

  @ViewChild('avatarInput') avatarInput!: ElementRef<HTMLInputElement>;

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

  // --- Avatar ---
  triggerAvatarUpload() {
    this.avatarInput?.nativeElement?.click();
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    // Validate client-side
    if (!file.type.match(/^image\/(jpeg|png|gif|webp)$/)) {
      this.toast.error(this.translate.instant('SETTINGS.PROFILE.AVATAR_INVALID_TYPE'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast.error(this.translate.instant('SETTINGS.PROFILE.AVATAR_TOO_LARGE'));
      return;
    }

    this.uploadingAvatar = true;
    this.cdr.detectChanges();

    this.authService.uploadAvatar(file)
      .pipe(finalize(() => {
        this.uploadingAvatar = false;
        input.value = ''; // Reset so same file can be re-selected
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (res) => {
          this.user = { ...this.user, avatar_url: res.avatar_url };
          this.toast.success(this.translate.instant('SETTINGS.PROFILE.AVATAR_UPDATED'));
        },
        error: () => {
          this.toast.error(this.translate.instant('SETTINGS.PROFILE.AVATAR_ERROR'));
        }
      });
  }

  removeAvatar() {
    if (!this.user?.avatar_url) return;

    this.uploadingAvatar = true;
    this.cdr.detectChanges();

    this.authService.removeAvatar()
      .pipe(finalize(() => {
        this.uploadingAvatar = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: () => {
          this.user = { ...this.user, avatar_url: null };
          this.toast.success(this.translate.instant('SETTINGS.PROFILE.AVATAR_REMOVED'));
        },
        error: () => {
          this.toast.error(this.translate.instant('SETTINGS.PROFILE.AVATAR_ERROR'));
        }
      });
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
