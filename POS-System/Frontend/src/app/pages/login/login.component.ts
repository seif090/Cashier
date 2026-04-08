import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="headline-sm text-primary">Architect POS</h1>
          <p class="body-md text-on-surface-variant">نظام نقطة البيع المتكامل</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label class="label-sm text-on-surface-variant">اسم المستخدم</label>
            <input 
              type="text" 
              formControlName="username" 
              class="input"
              placeholder="أدخل اسم المستخدم"
              autocomplete="username"
            />
            <div *ngIf="loginForm.get('username')?.invalid && loginForm.get('username')?.touched" class="error-message">
              <span class="label-sm text-error">اسم المستخدم مطلوب</span>
            </div>
          </div>

          <div class="form-group">
            <label class="label-sm text-on-surface-variant">كلمة المرور</label>
            <input 
              type="password" 
              formControlName="password" 
              class="input"
              placeholder="أدخل كلمة المرور"
              autocomplete="current-password"
            />
            <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="error-message">
              <span class="label-sm text-error">كلمة المرور مطلوبة</span>
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary w-full"
            [disabled]="loginForm.invalid || loading"
          >
            <span *ngIf="!loading">تسجيل الدخول</span>
            <span *ngIf="loading">جاري التسجيل...</span>
          </button>

          <div *ngIf="errorMessage" class="error-banner">
            <span class="label-sm">{{ errorMessage }}</span>
          </div>
        </form>

        <div class="login-footer">
          <p class="label-sm text-on-surface-variant">© 2026 Architect POS. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--surface);
      padding: var(--spacing-xl);
    }

    .login-card {
      background-color: var(--surface-container-lowest);
      border-radius: var(--radius-2xl);
      padding: var(--spacing-3xl);
      width: 100%;
      max-width: 420px;
      box-shadow: var(--shadow-ambient);
    }

    .login-header {
      text-align: center;
      margin-bottom: var(--spacing-2xl);
    }

    .login-header h1 {
      margin-bottom: var(--spacing-sm);
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-lg);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .error-message {
      margin-top: var(--spacing-xs);
    }

    .error-banner {
      background-color: var(--error-container);
      padding: var(--spacing-md);
      border-radius: var(--radius-lg);
      text-align: center;
    }

    .login-footer {
      text-align: center;
      margin-top: var(--spacing-2xl);
      padding-top: var(--spacing-lg);
      border-top: 1px solid var(--outline-variant);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate(['/pos']);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'فشل تسجيل الدخول. تحقق من بيانات الاعتماد.';
      }
    });
  }
}
