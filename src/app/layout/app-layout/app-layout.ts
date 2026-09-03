import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppSidebar } from '../app-sidebar/app-sidebar';
import { AppTopbar } from '../app-topbar/app-topbar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule, AppSidebar, AppTopbar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {}
