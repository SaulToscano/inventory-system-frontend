import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, AvatarModule, SkeletonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  user: any = null;
  loading: boolean = true;

  async ngOnInit() {
    try {
      const session = await this.authService.getSession();
      
      if (session && session.user) {
        this.user = session.user;
      }
    } catch (error) {
      console.error('Error al obtener la sesión:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges(); 
    }
  }
}
