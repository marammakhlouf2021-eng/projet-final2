import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

  token: string = '';
  role: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  erreur: string = '';
  succes: string = '';
  loading: boolean = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.role = params['role'] || '';
    });
  }

  reinitialiser() {
    this.erreur = '';
    this.succes = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.erreur = "Veuillez remplir tous les champs";
      return;
    }
    if (this.newPassword.length <= 6) {
      this.erreur = "Le mot de passe doit contenir plus de 6 caractères";
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(this.newPassword);
    const hasNumber = /[0-9]/.test(this.newPassword);
    if (!hasLetter || !hasNumber) {
      this.erreur = "Le mot de passe doit contenir au moins une lettre et un chiffre";
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.erreur = "Les mots de passe ne correspondent pas";
      return;
    }

    this.loading = true;
    this.api.resetPassword(this.token, this.newPassword).subscribe({
      next: (data: any) => {
        this.succes = data.message;
        this.loading = false;
        setTimeout(() => {
          if (this.role === 'professeur') this.router.navigate(['/login-professeur']);
          else if (this.role === 'etudiant') this.router.navigate(['/login-etudiant']);
          else if (this.role === 'administration') this.router.navigate(['/login-adminis']);
          else if (this.role === 'admin') this.router.navigate(['/admin']);
          else this.router.navigate(['/']);
        }, 2000);
      },
      error: (err: any) => {
        this.erreur = err.error?.message || "Erreur lors de la réinitialisation";
        this.loading = false;
      }
    });
  }
}