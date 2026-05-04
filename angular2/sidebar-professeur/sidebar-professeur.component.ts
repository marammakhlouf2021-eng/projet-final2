import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-professeur',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './sidebar-professeur.component.html',
  styleUrl: './sidebar-professeur.component.css'
})
export class SidebarProfesseurComponent {
  constructor(private router: Router) {}

  seDeconnecter() {
    localStorage.removeItem('professeur');
    this.router.navigate(['/login-professeur']);
  }
}