import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, shareReplay } from 'rxjs';
import { Router } from '@angular/router';

interface AuthResponse {
    access_token: string;
    refresh_token: string;
}

interface RegisterDto {
    business_name: string;
    full_name: string;
    email: string;
    password: string;
}

interface LoginDto {
    email: string;
    password: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://localhost:3000';
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    register(registerDto: RegisterDto): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, registerDto)
            .pipe(
                tap(response => this.handleAuthResponse(response))
            );
    }

    login(loginDto: LoginDto): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, loginDto)
            .pipe(
                tap(response => this.handleAuthResponse(response))
            );
    }

    logout(): void {
        const refreshToken = this.getRefreshToken();

        if (refreshToken) {
            this.http.post(`${this.baseUrl}/auth/logout`, { refresh_token: refreshToken })
                .subscribe({
                    next: () => this.clearTokensAndRedirect(),
                    error: () => this.clearTokensAndRedirect()
                });
        } else {
            this.clearTokensAndRedirect();
        }
    }

    refreshToken(): Observable<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        return this.http.post<AuthResponse>(`${this.baseUrl}/auth/refresh`, { refresh_token: refreshToken })
            .pipe(
                tap(response => this.handleAuthResponse(response))
            );
    }

    private handleAuthResponse(response: AuthResponse): void {
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        this.isAuthenticatedSubject.next(true);
    }

    private clearTokensAndRedirect(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
    }

    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    private hasToken(): boolean {
        return !!this.getAccessToken();
    }

    isLoggedIn(): boolean {
        return this.hasToken();
    }

    // New methods for Settings
    private profileRequest$: Observable<any> | null = null;
    private profileCache$: Observable<any> | null = null;

    getProfile(forceRefresh = false): Observable<any> {
        if (this.profileCache$ && !forceRefresh) {
            return this.profileCache$;
        }

        // Cache the observable
        this.profileCache$ = this.http.get(`${this.baseUrl}/users/profile`).pipe(
            shareReplay(1)
        );
        return this.profileCache$;
    }

    updateProfile(data: any): Observable<any> {
        // Clear cache on update
        this.profileCache$ = null;
        return this.http.patch(`${this.baseUrl}/users/profile`, data).pipe(
            tap(() => this.getProfile(true).subscribe()) // Refresh cache in background
        );
    }

    updateTenant(data: any): Observable<any> {
        return this.http.patch(`${this.baseUrl}/tenants/settings`, data);
    }
}
