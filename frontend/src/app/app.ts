import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './core/layout/header/header.component';
import { FooterComponent } from './core/layout/footer/footer.component';
import { LoginModalComponent } from './shared/auth/login/login-modal.component';
import { RegisterModalComponent } from './shared/auth/register/register-modal.component';
import { ForgotPasswordModalComponent } from './shared/auth/forgot-password/forgot-password-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoginModalComponent, RegisterModalComponent, ForgotPasswordModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'frontend';
}
