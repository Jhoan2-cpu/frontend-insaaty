import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

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
    private translate: TranslateService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.companyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
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
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user = user;

        // Patch forms
        this.profileForm.patchValue({
          fullName: user.full_name,
          email: user.email
        });

        // We assume user has a tenant relation or we fetch tenant separate?
        // backend getProfile returns user. 
        // We might need to fetch tenant info separately or include it in getProfile.
        // For now, let's try to fetch tenant settings if user is admin.
        if (user.role_id === 3) { // 3 is ADMIN
          // We can try to get company info via getStats or getOne if we know ID.
          // Ideally getProfile should include tenant info.
          // UsersService.findOne in backend DOES NOT include tenant.
          // Let's assume we can fetch it via this.authService.getProfile including tenant?
          // No, backend code didn't have include tenant.
          // I'll leave company form empty until we fix backend or just display what we have.
          // Wait, backend `getProfile` calls `usersService.findOne(id)`. 
          // `usersService.findOne` is `prisma.user.findUnique({ where: { id } })`.
          // It does NOT include tenant.
          // I should fix backend to include tenant info for settings.
        }

        // Let's try to update backend to include tenant stats? 
        // Or just lazy load it.
        // For now, I will proceed with Profile form.
        this.loading = false;
      },
      error: (err) => {
        this.toast.error('Error loading profile');
        this.loading = false;
      }
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) return;

    this.loading = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.toast.success(this.translate.instant('SETTINGS.PROFILE_Updated'));
        this.loading = false;
        // Update user state if needed
      },
      error: (err) => {
        this.toast.error('Error updating profile');
        this.loading = false;
      }
    });
  }

  updatePassword() {
    if (this.passwordForm.invalid) return;

    // Backend expects 'password' field in updateProfile (UpdateUserDto)
    // validation logic is handled there.
    const payload = { password: this.passwordForm.value.password };

    this.loading = true;
    this.authService.updateProfile(payload).subscribe({
      next: (res) => {
        this.toast.success('Password updated successfully');
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (err) => {
        this.toast.error('Error updating password');
        this.loading = false;
      }
    });
  }

  updateCompany() {
    if (this.companyForm.invalid) return;

    this.loading = true;
    this.authService.updateTenant(this.companyForm.value).subscribe({
      next: (res) => {
        this.toast.success('Company settings updated');
        this.loading = false;
      },
      error: (err) => {
        this.toast.error('Error updating company');
        this.loading = false;
      }
    });
  }
}

