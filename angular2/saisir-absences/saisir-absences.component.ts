import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarProfesseurComponent } from '../sidebar-professeur/sidebar-professeur.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-saisir-absences',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterModule, SidebarProfesseurComponent],
  templateUrl: './saisir-absences.component.html',
  styleUrl: './saisir-absences.component.css'
})
export class SaisirAbsencesComponent implements OnInit {

  professeur: any = null;
  emplois: any[] = [];
  etudiants: any[] = [];
  absencesExistantes: any[] = [];

  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  jourSelectionne: string = '';
  seancesFiltrees: any[] = [];
  seanceSelectionnee: string = '';
  seanceObj: any = null;
  dateSelectionnee: string = '';

  absences: { [etudiantId: string]: {
    absent: boolean,
    justifiee: boolean,
    type: string,
    dureeRetard: number,
    absenceId: string | null
  }} = {};

  constructor(private api: ApiService) {}

  ngOnInit() {
    const data = localStorage.getItem('professeur');
    if (data) {
      this.professeur = JSON.parse(data);
      this.chargerEmplois();
    }
  }

  chargerEmplois() {
    this.api.getEmploiByProfesseur(this.professeur._id).subscribe({
      next: (data: any) => this.emplois = data,
      error: (err: any) => console.log(err)
    });
  }

  onFiltreChange() {
    this.seanceSelectionnee = '';
    this.seanceObj = null;
    this.etudiants = [];
    this.seancesFiltrees = this.emplois.filter(
      (e: any) => e.jour === this.jourSelectionne
    );
  }

  onSeanceChange() {
    this.seanceObj = this.emplois.find((e: any) => e._id === this.seanceSelectionnee);
    if (this.seanceObj) {
      this.chargerEtudiants(this.seanceObj.classe?._id || this.seanceObj.classe);
    }
  }

 onDateChange() {
  if (this.dateSelectionnee) {
    const date = new Date(this.dateSelectionnee);
    const jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const jourDetecte = jours[date.getDay()];

    if (this.jours.includes(jourDetecte)) {
      this.jourSelectionne = jourDetecte;
      this.onFiltreChange();
    } else {
      this.jourSelectionne = '';
      this.seancesFiltrees = [];
      this.seanceSelectionnee = '';
      this.seanceObj = null;
      this.etudiants = [];
    }
  }

  if (this.seanceObj && this.dateSelectionnee) {
    this.chargerEtudiants(this.seanceObj.classe?._id || this.seanceObj.classe);
  }
}

  chargerEtudiants(classeId: string) {
    this.api.getEtudiants().subscribe({
      next: (data: any) => {
        this.etudiants = data.filter(
          (e: any) => (e.classe?._id || e.classe) === classeId
        );
        this.absences = {};
        this.etudiants.forEach((e: any) => {
          this.absences[e._id] = {
            absent: false,
            justifiee: false,
            type: 'absence',
            dureeRetard: 0,
            absenceId: null
          };
        });

        // Charger les absences existantes
        if (this.dateSelectionnee && this.seanceObj) {
          const matiereId = this.seanceObj.matiere?._id || this.seanceObj.matiere;
          this.api.getAbsencesBySeance(matiereId, this.dateSelectionnee).subscribe({
            next: (absData: any) => {
              absData.forEach((abs: any) => {
                const etudiantId = abs.etudiant?._id || abs.etudiant;
                if (this.absences[etudiantId]) {
                  this.absences[etudiantId] = {
                    absent: true,
                    justifiee: abs.justifiee,
                    type: abs.type || 'absence',
                    dureeRetard: abs.dureeRetard || 0,
                    absenceId: abs._id
                  };
                }
              });
            }
          });
        }
      },
      error: (err: any) => console.log(err)
    });
  }

  enregistrerAbsence(etudiantId: string) {
    if (!this.seanceSelectionnee || !this.dateSelectionnee) {
      alert("Veuillez choisir une séance et une date");
      return;
    }
    const abs = this.absences[etudiantId];
    const data = {
      etudiant: etudiantId,
      matiere: this.seanceObj.matiere?._id || this.seanceObj.matiere,
      date: new Date(this.dateSelectionnee),
      justifiee: abs.justifiee,
      type: abs.type,
      dureeRetard: abs.type === 'retard' ? abs.dureeRetard : 0,
      saisirPar: this.professeur._id
    };

    if (abs.absenceId) {
      // Modifier l'absence existante
      this.api.updateAbsence(abs.absenceId, data).subscribe({
        next: () => alert("Absence modifiée !"),
        error: (err: any) => console.log(err)
      });
    } else {
      // Nouvelle absence
      this.api.addAbsence(data).subscribe({
        next: (res: any) => {
          this.absences[etudiantId].absenceId = res._id;
          alert("Absence enregistrée !");
        },
        error: (err: any) => console.log(err)
      });
    }
  }

  enregistrerTout() {
    if (!this.seanceSelectionnee || !this.dateSelectionnee) {
      alert("Veuillez choisir une séance et une date");
      return;
    }
    const absentsOnly = this.etudiants.filter((e: any) => this.absences[e._id].absent);
    if (absentsOnly.length === 0) {
      alert("Aucun étudiant marqué absent ou en retard !");
      return;
    }
    absentsOnly.forEach((etu: any) => {
      const abs = this.absences[etu._id];
      const data = {
        etudiant: etu._id,
        matiere: this.seanceObj.matiere?._id || this.seanceObj.matiere,
        date: new Date(this.dateSelectionnee),
        justifiee: abs.justifiee,
        type: abs.type,
        dureeRetard: abs.type === 'retard' ? abs.dureeRetard : 0,
        saisirPar: this.professeur._id
      };
      if (abs.absenceId) {
        this.api.updateAbsence(abs.absenceId, data).subscribe({
          next: () => {},
          error: (err: any) => console.log(err)
        });
      } else {
        this.api.addAbsence(data).subscribe({
          next: (res: any) => {
            this.absences[etu._id].absenceId = res._id;
          },
          error: (err: any) => console.log(err)
        });
      }
    });
    alert("Absences enregistrées !");
  }

  supprimerAbsence(etudiantId: string) {
    const abs = this.absences[etudiantId];
    if (abs.absenceId) {
      this.api.deleteAbsence(abs.absenceId).subscribe({
        next: () => {
          this.absences[etudiantId] = {
            absent: false, justifiee: false,
            type: 'absence', dureeRetard: 0, absenceId: null
          };
          alert("Absence supprimée !");
        },
        error: (err: any) => console.log(err)
      });
    } else {
      this.absences[etudiantId].absent = false;
    }
  }
  aujourdhui: string = new Date().toISOString().split('T')[0];
}