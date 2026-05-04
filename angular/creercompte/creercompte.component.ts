import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-creercompte',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink, RouterLinkActive, RouterModule],
  templateUrl: './creercompte.component.html',
  styleUrl: './creercompte.component.css'
})
export class CreercompteComponent {

  demande = {
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    passwordConfirm: '',
    role: ''
  };

  erreur = '';
  succes = '';

  constructor(private api: ApiService, private router: Router) {}

 soumettre() {
  this.erreur = '';
  this.succes = '';

  if (!this.demande.nom || !this.demande.prenom || !this.demande.email ||
      !this.demande.password || !this.demande.role) {
    this.erreur = "Veuillez remplir tous les champs obligatoires";
    return;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(this.demande.email)) {
    this.erreur = "L'adresse email n'est pas valide (ex: nom@gmail.com)";
    return;
  }

  const telRegex = /^\d{8}$/;
  if (this.demande.telephone && !telRegex.test(this.demande.telephone)) {
    this.erreur = "Le numéro de téléphone doit contenir exactement 8 chiffres";
    return;
  }

  if (this.demande.password.length <= 6) {
    this.erreur = "Le mot de passe doit contenir plus de 6 caractères";
    return;
  }

  const hasLetter = /[a-zA-Z]/.test(this.demande.password);
  const hasNumber = /[0-9]/.test(this.demande.password);
  if (!hasLetter || !hasNumber) {
    this.erreur = "Le mot de passe doit contenir au moins une lettre et un chiffre";
    return;
  }

  if (this.demande.password !== this.demande.passwordConfirm) {
    this.erreur = "Les mots de passe ne correspondent pas";
    return;
  }

  // Vérifier si email existe avant d'envoyer
  this.api.verifierEmailExiste(this.demande.email).subscribe({
    next: (res: any) => {
      if (res.existe) {
        this.erreur = "Cet email est déjà utilisé dans le système";
        return;
      }

      const data = {
        nom: this.demande.nom,
        prenom: this.demande.prenom,
        email: this.demande.email,
        telephone: this.demande.telephone,
        password: this.demande.password,
        role: this.demande.role
      };

      this.api.addDemande(data).subscribe({
        next: () => {
          this.succes = "Votre demande a été envoyée ! En attente de validation par l'admin.";
          this.erreur = '';
          this.demande = {
            nom: '', prenom: '', email: '', telephone: '',
            password: '', passwordConfirm: '', role: ''
          };
        },
        error: (err: any) => {
          this.erreur = "Erreur lors de l'envoi de la demande";
          console.log(err);
        }
      });
    },
    error: () => {
      this.erreur = "Erreur lors de la vérification de l'email";
    }
  });
}
}