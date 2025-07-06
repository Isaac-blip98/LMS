import { Component, inject } from '@angular/core';
import { ModalService } from '../../modal/modal.service';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-register-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './register-modal.component.html',
})
export class RegisterModalComponent {
  modalService = inject(ModalService);
  auth = inject(AuthService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  successMessage = '';
  errorMessage = '';
  isLoading = false;


  close() {
    this.modalService.closeModals();
  }

  toggleToLogin() {
    this.modalService.openLogin();
  }

  register() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    this.isLoading = true;
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.successMessage = 'Registration successful!';
        this.isLoading = false;
        setTimeout(() => this.close(), 2000); 
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'Email is already registered';
        } else {
          this.errorMessage =
            'Registration failed: ' + (err?.error?.message || 'Try again');
        }
        console.error('Registration failed:', err);
      },
    });
  }
}
