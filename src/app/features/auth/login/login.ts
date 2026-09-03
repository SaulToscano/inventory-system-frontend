import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, PasswordModule, ButtonModule, MessageModule],
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = false;
  errorMessage = '';

  async onSubmit() {
    if (this.loginForm.invalid) return;
    
    this.loading = true;
    this.errorMessage = '';
    
    const { email, password } = this.loginForm.value;
    
    const { data, error } = await this.authService.signIn(email, password);

    this.loading = false;

    if (error) {
      this.errorMessage = 'Credenciales incorrectas.';
    } else {
      this.router.navigate(['/']); // Redirigir al layout principal tras éxito
    }
  }
}
