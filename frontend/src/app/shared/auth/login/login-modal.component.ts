import { Component, inject } from '@angular/core';
import { ModalService } from '../../modal/modal.service';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  modalService = inject(ModalService);
  auth = inject(AuthService);
  router = inject(Router);
  fb = inject(FormBuilder);

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
 
  

  close() {
    this.modalService.closeModals();
  }
  
  toggleToRegister() {
    this.modalService.openRegister();
  }

  login() {
    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;
    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(email, password).subscribe({
      next: (res) => {
        console.log('Login successful:', res);
        this.loginForm.reset();
        this.close();
        
        // Redirect based on user role
        if (this.auth.isAdmin()) {
          this.router.navigate(['/admin-dashboard']);
        } else if (this.auth.isInstructor()) {
          this.router.navigate(['/instructor/dashboard']);
        } else {
          this.router.navigate(['/courses']);
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.errorMessage = 'Invalid credentials';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}