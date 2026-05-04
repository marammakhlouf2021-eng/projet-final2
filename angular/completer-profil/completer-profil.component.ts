import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-completer-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './completer-profil.component.html',
  styleUrl: './completer-profil.component.css'
})
export class CompleterProfilComponent implements OnInit {

  token = '';
  email = '';
  erreur = '';
  succes = '';
  tokenInvalide = false;
  chargement = true;

  profil = {
    nom: '',
    prenom: '',
    telephone: '',
    password: '',
    passwordConfirm: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
    this.email = this.route.snapshot.queryParams['email'] || '';

    if (!this.token || !this.email) {
      this.tokenInvalide = true;
      this.chargement = false;
      return;
    }

    this.api.verifierTokenInvitation(this.token).subscribe({
      next: (res: any) => {
        if (!res.valide) {
          this.tokenInvalide = true;
        }
        this.chargement = false;
      },
      error: () => {
        this.tokenInvalide = true;
        this.chargement = false;
      }
    });
  }

  soumettre() {
    this.erreur = '';
    this.succes = '';

    if (!this.profil.nom || !this.profil.prenom || !this.profil.password) {
      this.erreur = "Nom, prénom et mot de passe sont obligatoires";
      return;
    }

    if (this.profil.password.length < 6) {
      this.erreur = "Le mot de passe doit contenir au moins 6 caractères";
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(this.profil.password);
    const hasNumber = /[0-9]/.test(this.profil.password);
    if (!hasLetter || !hasNumber) {
      this.erreur = "Le mot de passe doit contenir au moins une lettre et un chiffre";
      return;
    }

    if (this.profil.password !== this.profil.passwordConfirm) {
      this.erreur = "Les mots de passe ne correspondent pas";
      return;
    }

    const telRegex = /^\d{8}$/;
    if (this.profil.telephone && !telRegex.test(this.profil.telephone)) {
      this.erreur = "Le numéro de téléphone doit contenir exactement 8 chiffres";
      return;
    }

    this.api.completerProfil({
      token: this.token,
      email: this.email,
      nom: this.profil.nom,
      prenom: this.profil.prenom,
      telephone: this.profil.telephone,
      password: this.profil.password
    }).subscribe({
      next: () => {
  this.succes = "Compte créé avec succès ! Vous pouvez maintenant vous connecter.";
  const role = this.route.snapshot.queryParams['role'] || 'Professeur';
  if (role === 'Etudiant') {
    setTimeout(() => this.router.navigate(['/login-etudiant']), 2500);
  } else if (role === 'Administration') {
    setTimeout(() => this.router.navigate(['/login-adminis']), 2500);
  } else {
    setTimeout(() => this.router.navigate(['/login-professeur']), 2500);
  }
},
      error: (err: any) => {
        this.erreur = err.error?.message || "Erreur lors de la création du compte";
      }
    });
  }
}