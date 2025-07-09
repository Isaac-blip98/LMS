import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../modal/modal.service';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-forgot-password-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password-modal.component.html',
})
export class ForgotPasswordModalComponent {
  modalService = inject(ModalService);
  http = inject(HttpClient);

  step: 'email' | 'code' | 'success' = 'email';
  email = '';
  code = '';
  newPassword = '';
  loading = false;
  error = '';
  info = '';

  requestCode() {
    this.error = '';
    this.info = '';
    this.loading = true;
    this.http.post<any>('http://localhost:3000/auth/forgot-password', { email: this.email }).subscribe({
      next: () => {
        this.step = 'code';
        this.info = 'A reset code has been sent to your email.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to send reset code.';
        this.loading = false;
      }
    });
  }

  resetPassword() {
    this.error = '';
    this.info = '';
    this.loading = true;
    this.http.post<any>('http://localhost:3000/auth/reset-password', {
      email: this.email,
      code: this.code,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.step = 'success';
        this.info = 'Password reset successful. You can now log in.';
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to reset password.';
        this.loading = false;
      }
    });
  }

  close() {
    this.modalService.closeModals();
    this.step = 'email';
    this.email = '';
    this.code = '';
    this.newPassword = '';
    this.error = '';
    this.info = '';
  }
} 