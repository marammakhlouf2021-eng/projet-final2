import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {

  email: string = '';
  password: string = '';
  erreur: string = '';

  showForgotPassword = false;
  emailOublie = '';
  messageForgot = '';
  erreurForgot = '';

  constructor(private api: ApiService, private router: Router) {}

login() {
  this.erreur = '';
  if (!this.email || !this.password) {
    this.erreur = "Veuillez remplir tous les champs";
    return;
  }
  this.api.login({ email: this.email, password: this.password }).subscribe({
    next: (res: any) => {
      console.log("Success:", res);
      localStorage.setItem('user', JSON.stringify(res.user));
      this.router.navigate(['/gerer-p']);
    },
    error: (err: any) => {
      if (err.error?.message === "Utilisateur introuvable") {
        this.erreur = "Aucun compte trouvé avec cet email";
      } else if (err.error?.message === "Mot de passe incorrect") {
        this.erreur = "Mot de passe incorrect";
      } else {
        this.erreur = "Erreur de connexion";
      }
    }
  });
}

  envoyerMotDePasse() {
    if (!this.emailOublie) {
      this.erreurForgot = "Veuillez saisir votre email";
      return;
    }
    this.api.forgotPasswordAdmin(this.emailOublie).subscribe({
      next: (data: any) => {
        this.messageForgot = data.message;
        this.erreurForgot = '';
      },
      error: (err: any) => {
        this.erreurForgot = err.error?.message || "Email introuvable";
        this.messageForgot = '';
      }
    });
  }
}