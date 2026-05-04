import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarProfesseurComponent } from '../sidebar-professeur/sidebar-professeur.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-saisir-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterModule, SidebarProfesseurComponent],
  templateUrl: './saisir-notes.component.html',
  styleUrl: './saisir-notes.component.css'
})
export class SaisirNotesComponent implements OnInit {

  professeur: any = null;
  matieres: any[] = [];
  etudiants: any[] = [];
  classeSelectionnee: string = '';
  matiereSelectionnee: string = '';
  typeNote: string = '';
  semestreSelectionne: string = 'S1';
  notes: { [etudiantId: string]: number } = {};

  pourcentages = {
    DS1: 25,
    DS2: 25,
    Examen: 40,
    TP: 10
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    const data = localStorage.getItem('professeur');
    if (data) {
      this.professeur = JSON.parse(data);
      this.chargerMatieres();
    }
  }

 chargerMatieres() {
  this.api.getMatieres().subscribe({
    next: (data: any) => {
      this.matieres = [];

      data.forEach((mat: any) => {
        // Pour chaque classe assignée à cette matière
        mat.classes?.forEach((entry: any) => {
          const profId = entry.profId?._id || entry.profId;
          const dansAutorises = mat.profsAutorises?.some(
            (p: any) => (p._id || p) === this.professeur._id
          );
          const estProfAssigne = profId === this.professeur._id;
          const estProfPrincipal = (mat.professeur?._id || mat.professeur) === this.professeur._id;

          if (estProfAssigne || dansAutorises || estProfPrincipal) {
            // Ajouter une entrée par classe
            this.matieres.push({
              ...mat,
              classeActive: entry.classe
            });
          }
        });
      });
    },
    error: (err: any) => console.log(err)
  });
}

 onMatiereChange() {
  const mat = this.matieres.find((m: any) => m._id === this.matiereSelectionnee);
  if (mat) {
    this.classeSelectionnee = mat.classeActive?._id || mat.classeActive || '';
    this.notes = {};
    this.typeNote = '';
    if (this.classeSelectionnee) {
      this.chargerEtudiants();
    }
  }
}

  chargerEtudiants() {
    this.api.getEtudiants().subscribe({
      next: (data: any) => {
        this.etudiants = data.filter(
          (e: any) => (e.classe?._id || e.classe) === this.classeSelectionnee
        );
        // Réinitialiser les notes à 0
        this.notes = {};
        this.etudiants.forEach((e: any) => this.notes[e._id] = 0);
      },
      error: (err: any) => console.log(err)
    });
  }

  onTypeChange() {
    // Réinitialiser toutes les notes à 0
    this.notes = {};
    this.etudiants.forEach((e: any) => this.notes[e._id] = 0);

    if (this.matiereSelectionnee && this.typeNote && this.semestreSelectionne) {
      this.api.getNotesByMatiere(this.matiereSelectionnee).subscribe({
        next: (notesData: any) => {
          notesData.forEach((n: any) => {
            const etudiantId = n.etudiant?._id || n.etudiant;
            if (n.type === this.typeNote && n.semestre === this.semestreSelectionne) {
              this.notes[etudiantId] = n.note;
            }
          });
        }
      });
    }
  }

  onSemestreChange() {
    // Réinitialiser les notes quand on change de semestre
    this.notes = {};
    this.etudiants.forEach((e: any) => this.notes[e._id] = 0);
    this.typeNote = '';
  }

  getTotalPourcentage(): number {
    return Object.values(this.pourcentages).reduce((a, b) => a + b, 0);
  }

  enregistrerNote(etudiantId: string) {
    if (!this.matiereSelectionnee || !this.typeNote || !this.semestreSelectionne) {
      alert("Veuillez choisir une matière, un semestre et un type");
      return;
    }
    const note = this.notes[etudiantId];
    if (note === undefined || note < 0 || note > 20) {
      alert("La note doit être entre 0 et 20 !");
      return;
    }
    const data = {
      etudiant: etudiantId,
      matiere: this.matiereSelectionnee,
      note: note,
      type: this.typeNote,
      semestre: this.semestreSelectionne,
      saisirPar: this.professeur._id
    };
    this.api.addNote(data).subscribe({
      next: () => alert("Note enregistrée !"),
      error: (err: any) => console.log(err)
    });
  }

  enregistrerTout() {
    if (!this.matiereSelectionnee || !this.typeNote || !this.semestreSelectionne) {
      alert("Veuillez choisir une matière, un semestre et un type");
      return;
    }
    const notesInvalides = this.etudiants.filter(
      (e: any) => this.notes[e._id] < 0 || this.notes[e._id] > 20
    );
    if (notesInvalides.length > 0) {
      alert("Certaines notes sont invalides ! Entre 0 et 20");
      return;
    }
    this.etudiants.forEach((etu: any) => {
      const data = {
        etudiant: etu._id,
        matiere: this.matiereSelectionnee,
        note: this.notes[etu._id] || 0,
        type: this.typeNote,
        semestre: this.semestreSelectionne,
        saisirPar: this.professeur._id
      };
      this.api.addNote(data).subscribe({
        next: () => {},
        error: (err: any) => console.log(err)
      });
    });
    alert("Toutes les notes enregistrées !");
  }
  verifierNote(etudiantId: string) {
  const note = this.notes[etudiantId];
  if (note > 20) {
    alert("⚠️ La note ne peut pas dépasser 20 !");
    this.notes[etudiantId] = 0;
  }
  if (note < 0) {
    alert("⚠️ La note ne peut pas être négative !");
    this.notes[etudiantId] = 0;
  }
}
}