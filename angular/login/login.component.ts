import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../services/api.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './login.component.html', 
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private api: ApiService) {}

  login() {
  if (!this.username || !this.password) {
    alert("Veuillez remplir tous les champs");
    return;
  }

  this.api.login({
    username: this.username,
    password: this.password
  }).subscribe({
    next: (res: any) => {
      console.log("Success:", res);
      alert("Connexion réussie");
    },
    error: (err: any) => {
      console.log("Error:", err);
      
      alert(err?.error?.message || "Utilisateur ou mot de passe incorrect");
    }
  });
}
}