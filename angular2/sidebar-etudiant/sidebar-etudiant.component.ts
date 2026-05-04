import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar-etudiant',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './sidebar-etudiant.component.html',
  styleUrl: './sidebar-etudiant.component.css'
})
export class SidebarEtudiantComponent {
  constructor(private router: Router) {}

  seDeconnecter() {
    localStorage.removeItem('etudiant');
    this.router.navigate(['/login-etudiant']);
  }
}