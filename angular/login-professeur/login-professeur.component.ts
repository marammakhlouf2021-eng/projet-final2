import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login-professeur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-professeur.component.html',
  styleUrl: './login-professeur.component.css'
})
export class LoginProfesseurComponent {

  email = '';
  password = '';
  erreur = '';

  constructor(private api: ApiService, private router: Router) {}

 seConnecter() {
  if (!this.email || !this.password) {
    this.erreur = "Veuillez remplir tous les champs";
    return;
  }
  this.api.loginProfesseur({ email: this.email, password: this.password }).subscribe({
    next: (data: any) => {
      localStorage.setItem('professeur', JSON.stringify(data.professeur));
      this.router.navigate(['/esp-professeur']);
    },
    error: (err: any) => {
      if (err.error?.message === "Professeur introuvable") {
        this.erreur = "Aucun compte trouvé avec cet email";
      } else if (err.error?.message === "Mot de passe incorrect") {
        this.erreur = "Mot de passe incorrect";
      } else {
        this.erreur = "Erreur de connexion";
      }
    }
  });
}
  showForgotPassword = false;
emailOublie = '';
messageForgot = '';
erreurForgot = '';

envoyerMotDePasse() {
  if (!this.emailOublie) {
    this.erreurForgot = "Veuillez saisir votre email";
    return;
  }
  this.api.forgotPasswordProfesseur(this.emailOublie).subscribe({
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