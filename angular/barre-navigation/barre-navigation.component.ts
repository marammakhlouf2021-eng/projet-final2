import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-barre-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './barre-navigation.component.html',
  styleUrl: './barre-navigation.component.css'
})
export class BarreNavigationComponent {

  constructor(private router: Router) {}

  seDeconnecter() {
    localStorage.removeItem('admin');
    this.router.navigate(['/']);
  }
}