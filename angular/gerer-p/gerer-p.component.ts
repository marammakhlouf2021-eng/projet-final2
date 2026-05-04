import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { BarreNavigationComponent } from '../barre-navigation/barre-navigation.component';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gerer-p',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, BarreNavigationComponent, CommonModule, FormsModule],
  templateUrl: './gerer-p.component.html',
  styleUrl: './gerer-p.component.css'
})
export class GererPComponent implements OnInit {

  professeurs: any[] = [];
  toutesLesMatieres: any[] = [];
  matieresUniques: any[] = [];
  matieresSelectionnees: string[] = [];
  professeurModifier: any = null;
  showForm = false;
  erreurForm = '';
  successForm = '';
  nouveauProf = { email: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerProfesseurs();
    this.chargerMatieres();
  }

  chargerProfesseurs() {
    this.api.getProfesseurs().subscribe({
      next: (data: any) => this.professeurs = data,
      error: (err: any) => console.log(err)
    });
  }

  chargerMatieres() {
    this.api.getMatieres().subscribe({
      next: (data: any) => {
        this.toutesLesMatieres = data;
        const map: any = {};
        data.forEach((mat: any) => {
          if (!map[mat.nom]) map[mat.nom] = mat;
        });
        this.matieresUniques = Object.values(map);
      },
      error: (err: any) => console.log(err)
    });
  }

  toggleMatiere(matiereId: string) {
    const index = this.matieresSelectionnees.indexOf(matiereId);
    if (index === -1) this.matieresSelectionnees.push(matiereId);
    else this.matieresSelectionnees.splice(index, 1);
  }

  ajouter() {
    this.erreurForm = '';
    this.successForm = '';

    if (!this.nouveauProf.email) {
      this.erreurForm = "L'email est obligatoire";
      return;
    }

    this.api.verifierEmailExiste(this.nouveauProf.email).subscribe({
      next: (res: any) => {
        if (res.existe) {
          this.erreurForm = "Cet email est déjà utilisé dans le système";
          return;
        }

        this.api.inviterProfesseur({
          email: this.nouveauProf.email,
          matieresAutorisees: this.matieresSelectionnees
        }).subscribe({
          next: () => {
            this.successForm = `Invitation envoyée à ${this.nouveauProf.email}`;
            this.nouveauProf = { email: '' };
            this.matieresSelectionnees = [];
            setTimeout(() => {
              this.showForm = false;
              this.successForm = '';
            }, 2000);
            this.chargerProfesseurs();
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
    if (confirm("Voulez-vous vraiment supprimer ce professeur ?")) {
      this.api.deleteProfesseur(id).subscribe({
        next: () => this.chargerProfesseurs(),
        error: (err: any) => console.log(err)
      });
    }
  }

  modifier(prof: any) {
    this.professeurModifier = { ...prof };
  }

  enregistrerModification() {
    this.api.updateProfesseur(this.professeurModifier._id, this.professeurModifier).subscribe({
      next: () => {
        this.professeurModifier = null;
        this.chargerProfesseurs();
      },
      error: (err: any) => console.log(err)
    });
  }

  annuler() {
    this.professeurModifier = null;
  }
}