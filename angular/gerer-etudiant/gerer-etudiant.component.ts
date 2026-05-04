import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { BarreNavigationComponent } from '../barre-navigation/barre-navigation.component';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gerer-etudiant',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, BarreNavigationComponent, CommonModule, FormsModule],
  templateUrl: './gerer-etudiant.component.html',
  styleUrl: './gerer-etudiant.component.css'
})
export class GererEtudiantComponent implements OnInit {

  etudiants: any[] = [];
  classes: any[] = [];
  etudiantModifier: any = null;
  showForm = false;
  erreurForm = '';
  successForm = '';
  nouvelEtu = { email: '', classe: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerEtudiants();
    this.chargerClasses();
  }

  chargerEtudiants() {
    this.api.getEtudiants().subscribe({
      next: (data: any) => this.etudiants = data,
      error: (err: any) => console.log(err)
    });
  }

  chargerClasses() {
    this.api.getClasses().subscribe({
      next: (data: any) => this.classes = data,
      error: (err: any) => console.log(err)
    });
  }

  ajouter() {
    this.erreurForm = '';
    this.successForm = '';

    if (!this.nouvelEtu.email) {
      this.erreurForm = "L'email est obligatoire";
      return;
    }

    this.api.verifierEmailExiste(this.nouvelEtu.email).subscribe({
      next: (res: any) => {
        if (res.existe) {
          this.erreurForm = "Cet email est déjà utilisé dans le système";
          return;
        }

        this.api.inviterEtudiant({
          email: this.nouvelEtu.email,
          classe: this.nouvelEtu.classe || null
        }).subscribe({
          next: () => {
            this.successForm = `Invitation envoyée à ${this.nouvelEtu.email}`;
            this.nouvelEtu = { email: '', classe: '' };
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

  supprimer(id: string) {
    if (confirm("Voulez-vous vraiment supprimer ?")) {
      this.api.deleteEtudiant(id).subscribe({
        next: () => this.chargerEtudiants(),
        error: (err: any) => console.log(err)
      });
    }
  }

  modifier(etu: any) {
    this.etudiantModifier = { ...etu, classe: etu.classe?._id || etu.classe };
  }

  enregistrerModification() {
    this.api.updateEtudiant(this.etudiantModifier._id, this.etudiantModifier).subscribe({
      next: () => {
        this.etudiantModifier = null;
        this.chargerEtudiants();
      },
      error: (err: any) => console.log(err)
    });
  }

  annuler() {
    this.etudiantModifier = null;
  }
}