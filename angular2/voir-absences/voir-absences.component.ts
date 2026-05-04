import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarProfesseurComponent } from '../sidebar-professeur/sidebar-professeur.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-voir-absences',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterModule, SidebarProfesseurComponent],
  templateUrl: './voir-absences.component.html',
  styleUrl: './voir-absences.component.css'
})
export class VoirAbsencesComponent implements OnInit {

  professeur: any = null;
  emplois: any[] = [];
  classes: any[] = [];
  absences: any[] = [];
  absenceModifier: any = null;

  classeSelectionnee: string = '';
  dateSelectionnee: string = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    const data = localStorage.getItem('professeur');
    if (data) {
      this.professeur = JSON.parse(data);
      this.chargerClasses();
    }
  }

  chargerClasses() {
    this.api.getEmploiByProfesseur(this.professeur._id).subscribe({
      next: (data: any) => {
        this.emplois = data;
        const classesMap: any = {};
        data.forEach((e: any) => {
          const classeId = e.classe?._id || e.classe;
          if (!classesMap[classeId]) {
            classesMap[classeId] = e.classe;
          }
        });
        this.classes = Object.values(classesMap);
      },
      error: (err: any) => console.log(err)
    });
  }

  chargerAbsences() {
    if (!this.classeSelectionnee || !this.dateSelectionnee) return;
    this.api.getAbsencesByClasse(this.classeSelectionnee, this.dateSelectionnee).subscribe({
      next: (data: any) => this.absences = data,
      error: (err: any) => console.log(err)
    });
  }

  modifier(abs: any) {
    this.absenceModifier = { ...abs };
  }

  enregistrerModification() {
    this.api.updateAbsence(this.absenceModifier._id, {
      justifiee: this.absenceModifier.justifiee,
      type: this.absenceModifier.type,
      dureeRetard: this.absenceModifier.dureeRetard
    }).subscribe({
      next: () => {
        this.absenceModifier = null;
        this.chargerAbsences();
        alert("Absence modifiée !");
      },
      error: (err: any) => console.log(err)
    });
  }

  supprimer(id: string) {
    if (confirm("Supprimer cette absence ?")) {
      this.api.deleteAbsence(id).subscribe({
        next: () => {
          this.chargerAbsences();
          alert("Absence supprimée !");
        },
        error: (err: any) => console.log(err)
      });
    }
  }

  getTypeLabel(type: string) {
    return type === 'retard' ? '⏰ Retard' : '❌ Absence';
  }
}