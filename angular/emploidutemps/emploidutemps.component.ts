import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideAdminisComponent } from '../side-adminis/side-adminis.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-emploidutemps',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, FormsModule, SideAdminisComponent],
  templateUrl: './emploidutemps.component.html',
  styleUrl: './emploidutemps.component.css'
})
export class EmploidutempsComponent implements OnInit {

  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  heures: string[] = [];

  classes: any[] = [];
  matieres: any[] = [];
  professeurs: any[] = [];
  emplois: any[] = [];
  matieresFiltrees: any[] = [];
  professeursFiltres: any[] = [];

  classeSelectionnee = '';
  showForm = false;
  erreurAjout = '';

  nouvelEmploi = {
    classe: '', jour: '', heureDebut: '',
    heureFin: '', matiere: '', professeur: '', salle: ''
  };

  constructor(private api: ApiService) {
    this.genererHeures();
  }

  genererHeures() {
    for (let h = 8; h <= 17; h++) {
      this.heures.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 17) this.heures.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  ngOnInit() {
    this.chargerClasses();
    this.chargerMatieres();
    this.chargerProfesseurs();
  }

  chargerClasses() {
    this.api.getClasses().subscribe({
      next: (data: any) => this.classes = data,
      error: (err: any) => console.log(err)
    });
  }

  chargerMatieres() {
    this.api.getMatieres().subscribe({
      next: (data: any) => this.matieres = data,
      error: (err: any) => console.log(err)
    });
  }

  chargerProfesseurs() {
    this.api.getProfesseurs().subscribe({
      next: (data: any) => this.professeurs = data,
      error: (err: any) => console.log(err)
    });
  }

  chargerEmploi() {
    if (!this.classeSelectionnee) return;
    this.api.getEmploiByClasse(this.classeSelectionnee).subscribe({
      next: (data: any) => this.emplois = data,
      error: (err: any) => console.log(err)
    });
    this.matieresFiltrees = this.matieres.filter((mat: any) =>
      mat.classes?.some((c: any) =>
        (c.classe?._id || c.classe) === this.classeSelectionnee
      )
    );
  }

  onMatiereChange() {
  const matiere = this.matieresFiltrees.find(m => m._id === this.nouvelEmploi.matiere);
  if (!matiere) return;

  // Profs autorisés pour cette matière
  this.professeursFiltres = matiere.profsAutorises || [];

  // Chercher le prof assigné à cette classe dans cette matière
  const entryClasse = matiere.classes?.find((c: any) =>
    (c.classe?._id || c.classe) === this.classeSelectionnee
  );

  if (entryClasse?.profId) {
    // Prof assigné trouvé — le sélectionner automatiquement
    const profId = entryClasse.profId?._id || entryClasse.profId;
    this.nouvelEmploi.professeur = profId;
  } else {
    this.nouvelEmploi.professeur = '';
  }
}

  getCellule(jour: string, heure: string) {
    return this.emplois.find(e => e.jour === jour && e.heureDebut === heure);
  }

  getRowspan(jour: string, heure: string): number {
  const seance = this.emplois.find(e => e.jour === jour && e.heureDebut === heure);
  if (!seance) return 1;
  const debut = this.heures.indexOf(seance.heureDebut);
  const fin = this.heures.indexOf(seance.heureFin);
  if (debut === -1 || fin === -1 || fin <= debut) return 1;
  return fin - debut + 1;
}

estCachee(jour: string, heure: string): boolean {
  return this.emplois.some(e => {
    if (e.jour !== jour) return false;
    const debutIdx = this.heures.indexOf(e.heureDebut);
    const finIdx = this.heures.indexOf(e.heureFin);
    const heureIdx = this.heures.indexOf(heure);
    return heureIdx > debutIdx && heureIdx <= finIdx;
  });
}

  supprimer(id: string) {
    if (confirm("Supprimer ce créneau ?")) {
      this.api.deleteEmploi(id).subscribe({
        next: () => this.chargerEmploi(),
        error: (err: any) => console.log(err)
      });
    }
  }

  ajouterEmploi() {
    this.erreurAjout = '';
    this.nouvelEmploi.classe = this.classeSelectionnee;

    if (!this.nouvelEmploi.jour || !this.nouvelEmploi.heureDebut ||
        !this.nouvelEmploi.heureFin || !this.nouvelEmploi.matiere ||
        !this.nouvelEmploi.professeur) {
      this.erreurAjout = "Veuillez remplir tous les champs obligatoires";
      return;
    }

    if (this.nouvelEmploi.heureFin <= this.nouvelEmploi.heureDebut) {
      this.erreurAjout = "L'heure de fin doit être après l'heure de début";
      return;
    }

    this.api.addEmploi(this.nouvelEmploi).subscribe({
      next: () => {
        this.showForm = false;
        this.erreurAjout = '';
        this.nouvelEmploi = {
          classe: '', jour: '', heureDebut: '',
          heureFin: '', matiere: '', professeur: '', salle: ''
        };
        this.chargerEmploi();
      },
      error: (err: any) => {
        this.erreurAjout = err.error?.message || "Erreur lors de l'ajout";
      }
    });
  }
}