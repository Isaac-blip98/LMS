import { Component, inject } from '@angular/core';
import { ModalService } from '../../modal/modal.service';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  modalService = inject(ModalService);
  auth = inject(AuthService);
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