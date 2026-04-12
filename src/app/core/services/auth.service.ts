import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, TokenResponse, UserOut } from '../models/models';

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;

  currentUser = signal<UserOut | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest) {
    return this.http
      .post<TokenResponse>(`${this.api}/auth/login`, credentials)
      .pipe(
        tap((res) => {
          localStorage.setItem(TOKEN_KEY, res.access_token);
          this.fetchMe().subscribe();
        })
      );
  }

  fetchMe() {
    return this.http.get<UserOut>(`${this.api}/auth/me`).pipe(
      tap((user) => this.currentUser.set(user))
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  initSession() {
    if (this.isLoggedIn()) {
      this.fetchMe().subscribe();
    }
  }
}
