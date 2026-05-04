import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarEtudiantComponent } from '../sidebar-etudiant/sidebar-etudiant.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-mes-absences',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, SidebarEtudiantComponent],
  templateUrl: './mes-absences.component.html',
  styleUrl: './mes-absences.component.css'
})
export class MesAbsencesComponent implements OnInit {

  etudiant: any = null;
  absences: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    const data = localStorage.getItem('etudiant');
    if (data) {
      this.etudiant = JSON.parse(data);
      this.chargerAbsences();
    }
  }

  chargerAbsences() {
    this.api.getAbsencesByEtudiant(this.etudiant._id).subscribe({
      next: (data: any) => this.absences = data,
      error: (err: any) => console.log(err)
    });
  }

  getTypeLabel(type: string) {
    return type === 'retard' ? ' Retard' : 'Absence';
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  get totalAbsences() {
    return this.absences.filter(a => a.type === 'absence').length;
  }

  get totalRetards() {
    return this.absences.filter(a => a.type === 'retard').length;
  }

  get totalNonJustifiees() {
    return this.absences.filter(a => !a.justifiee).length;
  }
}