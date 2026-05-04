import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SideAdminisComponent } from '../side-adminis/side-adminis.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-gestion-semestres',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterModule, SideAdminisComponent],
  templateUrl: './gestion-semestres.component.html',
  styleUrl: './gestion-semestres.component.css'
})
export class GestionSemestresComponent implements OnInit {

  classes: any[] = [];
  semestres: any[] = [];
  classeSelectionnee: string = '';
  semestreSelectionne: string = 'S1';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerClasses();
    this.chargerSemestres();
  }

  chargerClasses() {
    this.api.getClasses().subscribe({
      next: (data: any) => this.classes = data,
      error: (err: any) => console.log(err)
    });
  }

  chargerSemestres() {
    this.api.getSemestres().subscribe({
      next: (data: any) => this.semestres = data,
      error: (err: any) => console.log(err)
    });
  }

  estCloture(classeId: string, semestre: string): boolean {
    return this.semestres.some(
      s => (s.classe?._id || s.classe) === classeId
        && s.semestre === semestre
        && s.statut === 'cloture'
    );
  }

decloturer(classeId: string, semestre: string) {
  if (confirm(`Cacher les notes du ${semestre} aux étudiants ?`)) {
    this.api.decloturerSemestre(classeId, semestre).subscribe({
      next: () => {
        // Mettre à jour localement sans attendre l'API
        const index = this.semestres.findIndex(
          s => (s.classe?._id || s.classe) === classeId && s.semestre === semestre
        );
        if (index !== -1) {
          this.semestres[index].statut = 'en_cours';
        } else {
          this.semestres.push({ classe: { _id: classeId }, semestre, statut: 'en_cours' });
        }
        // Forcer la détection de changement
        this.semestres = [...this.semestres];
        this.chargerSemestres();
      },
      error: (err: any) => console.log(err)
    });
  }
}

cloturer(classeId: string, semestre: string) {
  if (confirm(`Afficher les notes du ${semestre} aux étudiants ?`)) {
    this.api.cloturerSemestre(classeId, semestre).subscribe({
      next: () => {
        // Mettre à jour localement sans attendre l'API
        const index = this.semestres.findIndex(
          s => (s.classe?._id || s.classe) === classeId && s.semestre === semestre
        );
        if (index !== -1) {
          this.semestres[index].statut = 'cloture';
        } else {
          this.semestres.push({ classe: { _id: classeId }, semestre, statut: 'cloture' });
        }
        // Forcer la détection de changement
        this.semestres = [...this.semestres];
        this.chargerSemestres();
      },
      error: (err: any) => console.log(err)
    });
  }
}

  ouvrirSemestre(classeId: string, semestre: string) {
    // Réouvrir le semestre si besoin
    this.api.cloturerSemestre(classeId, semestre + '_reopen').subscribe({
      next: () => this.chargerSemestres()
    });
  }
}