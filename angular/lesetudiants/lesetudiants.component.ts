import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideAdminisComponent } from '../side-adminis/side-adminis.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-lesetudiants',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, FormsModule, SideAdminisComponent],
  templateUrl: './lesetudiants.component.html',
  styleUrl: './lesetudiants.component.css'
})
export class LesetudiantsComponent implements OnInit {

  etudiants: any[] = [];
  etudiantsFiltres: any[] = [];
  classes: any[] = [];
  showForm = false;
  etudiantModifier: any = null;
  classeSelectionnee = '';
  erreurForm = '';
  successForm = '';

  nouvelEtudiant = { email: '', classe: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerEtudiants();
    this.chargerClasses();
  }

  chargerEtudiants() {
    this.api.getEtudiants().subscribe({
      next: (data: any) => {
        this.etudiants = data;
        this.etudiantsFiltres = data;
      },
      error: (err: any) => console.log(err)
    });
  }

  chargerClasses() {
    this.api.getClasses().subscribe({
      next: (data: any) => this.classes = data,
      error: (err: any) => console.log(err)
    });
  }

  filtrerParClasse() {
    if (!this.classeSelectionnee) {
      this.etudiantsFiltres = this.etudiants;
    } else if (this.classeSelectionnee === 'sans-classe') {
      this.etudiantsFiltres = this.etudiants.filter(e => !e.classe);
    } else {
      this.etudiantsFiltres = this.etudiants.filter(e =>
        (e.classe?._id || e.classe)?.toString() === this.classeSelectionnee
      );
    }
  }

  ajouterEtudiant() {
    this.erreurForm = '';
    this.successForm = '';

    if (!this.nouvelEtudiant.email) {
      this.erreurForm = "L'email est obligatoire";
      return;
    }

    if (!this.nouvelEtudiant.classe) {
      this.erreurForm = "La classe est obligatoire";
      return;
    }

    this.api.verifierEmailExiste(this.nouvelEtudiant.email).subscribe({
      next: (res: any) => {
        if (res.existe) {
          this.erreurForm = "Cet email est déjà utilisé dans le système";
          return;
        }

        this.api.inviterEtudiant({
          email: this.nouvelEtudiant.email,
          classe: this.nouvelEtudiant.classe
        }).subscribe({
          next: () => {
            this.successForm = `Invitation envoyée à ${this.nouvelEtudiant.email}`;
            this.nouvelEtudiant = { email: '', classe: '' };
            setTimeout(() => {
              this.showForm = false;
              this.successForm = '';
            }, 2000);
            this.chargerEtudiants();
          },
          error: (err: any) => {
            this.erreurForm = err.error?.message || "Erreur lors de l'envoi";
          }
        });
      },
      error: () => {
        this.erreurForm = "Erreur lors de la vérification de l'email";
      }
    });
  }

  modifier(etu: any) {
    this.etudiantModifier = { ...etu, classe: etu.classe?._id || etu.classe };
  }

  enregistrer() {
    this.api.updateEtudiant(this.etudiantModifier._id, this.etudiantModifier).subscribe({
      next: () => {
        this.etudiantModifier = null;
        this.chargerEtudiants();
      },
      error: (err: any) => console.log(err)
    });
  }

  supprimer(id: string) {
    if (confirm("Supprimer cet étudiant ?")) {
      this.api.deleteEtudiant(id).subscribe({
        next: () => this.chargerEtudiants(),
        error: (err: any) => console.log(err)
      });
    }
  }
}