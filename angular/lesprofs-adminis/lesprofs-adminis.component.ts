import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideAdminisComponent } from '../side-adminis/side-adminis.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-lesprofs-adminis',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, FormsModule, SideAdminisComponent],
  templateUrl: './lesprofs-adminis.component.html',
  styleUrl: './lesprofs-adminis.component.css'
})
export class LesprofsAdminisComponent implements OnInit {

  professeurs: any[] = [];
  professeursFiltres: any[] = [];
  classes: any[] = [];
  toutesLesMatieres: any[] = [];
  matiereGroupeesData: any[] = [];
  matieresSelectionnees: string[] = [];
  matieresModifier: string[] = [];
  classeSelectionnee: string = '';
  profModifier: any = null;
  showForm = false;
  erreurForm = '';
  successForm = '';
  matieresUniques: any[] = [];
  nouveauProf = { email: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerProfesseurs();
    this.chargerClasses();
    this.chargerToutesLesMatieres();
  }

  chargerProfesseurs() {
    this.api.getProfesseurs().subscribe({
      next: (data: any) => {
        this.professeurs = data;
        this.professeursFiltres = data;
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

  chargerToutesLesMatieres() {
    this.api.getMatieres().subscribe({
      next: (data: any) => {
        this.toutesLesMatieres = data;
        this.calculerMatiereGroupees();
      },
      error: (err: any) => console.log(err)
    });
  }

 calculerMatiereGroupees() {
  const map: any = {};
  this.toutesLesMatieres.forEach((mat: any) => {
    if (!map[mat.nom]) {
      map[mat.nom] = mat;
    }
  });
  this.matieresUniques = Object.values(map);
}

  getMatieresAutorisees(prof: any): any[] {
    if (!prof.matieresAutorisees?.length) return [];
    return prof.matieresAutorisees.map((m: any) => {
      const found = this.toutesLesMatieres.find(mat => mat._id === (m._id || m));
      return found || null;
    }).filter(Boolean);
  }

  ajouterProf() {
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

  filtrerParClasse() {
    if (!this.classeSelectionnee) {
      this.professeursFiltres = this.professeurs;
    } else if (this.classeSelectionnee === 'sans-classe') {
      this.professeursFiltres = this.professeurs.filter(
        (prof: any) => !prof.matieresAutorisees || prof.matieresAutorisees.length === 0
      );
    } else {
      this.professeursFiltres = this.professeurs.filter((prof: any) =>
        prof.matieresAutorisees?.some((m: any) => {
          const mat = this.toutesLesMatieres.find(mat => mat._id === (m._id || m));
          return mat?.classes?.some((c: any) =>
            (c.classe?._id || c.classe)?.toString() === this.classeSelectionnee
          );
        })
      );
    }
  }

  toggleMatiere(matiereId: string) {
    const index = this.matieresSelectionnees.indexOf(matiereId);
    if (index === -1) this.matieresSelectionnees.push(matiereId);
    else this.matieresSelectionnees.splice(index, 1);
  }

  toggleMatiereModifier(matiereId: string) {
    const index = this.matieresModifier.indexOf(matiereId);
    if (index === -1) this.matieresModifier.push(matiereId);
    else this.matieresModifier.splice(index, 1);
  }

  modifier(prof: any) {
    this.profModifier = { ...prof };
    this.matieresModifier = prof.matieresAutorisees?.map((m: any) => m._id || m) || [];
  }

  enregistrer() {
    this.api.updateProfesseur(this.profModifier._id, {
      nom: this.profModifier.nom,
      prenom: this.profModifier.prenom,
      email: this.profModifier.email,
      telephone: this.profModifier.telephone
    }).subscribe({
      next: () => {
        this.api.updateMatieresAutorisees(this.profModifier._id, this.matieresModifier).subscribe({
          next: () => {
            this.profModifier = null;
            this.matieresModifier = [];
            this.chargerProfesseurs();
          },
          error: (err: any) => console.log('erreur matieres:', err)
        });
      },
      error: (err: any) => console.log('erreur update prof:', err)
    });
  }

  supprimer(id: string) {
    if (confirm("Supprimer ce professeur ?")) {
      this.api.deleteProfesseur(id).subscribe({
        next: () => this.chargerProfesseurs(),
        error: (err: any) => console.log(err)
      });
    }
  }
}