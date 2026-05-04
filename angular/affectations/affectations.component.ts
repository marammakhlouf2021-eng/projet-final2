import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideAdminisComponent } from '../side-adminis/side-adminis.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-affectations',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, FormsModule, SideAdminisComponent],
  templateUrl: './affectations.component.html',
  styleUrl: './affectations.component.css'
})
export class AffectationsComponent implements OnInit {

  etudiants: any[] = [];
  etudiantsFiltres: any[] = [];
  classes: any[] = [];
  classeSelectionnee = '';
  modificationsEnAttente = new Map<string, string>();
  succes = '';

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
    this.modificationsEnAttente.clear();
  }

  marquerModification(etudiantId: string, event: any) {
    const classeId = event.target.value;
    if (classeId) {
      this.modificationsEnAttente.set(etudiantId, classeId);
    } else {
      this.modificationsEnAttente.delete(etudiantId);
    }
  }

  enregistrerTout() {
    if (this.modificationsEnAttente.size === 0) return;

    const promesses = Array.from(this.modificationsEnAttente.entries()).map(
      ([etudiantId, classeId]) =>
        this.api.affecterEtudiantClasse(etudiantId, classeId).toPromise()
    );

    Promise.all(promesses).then(() => {
      this.succes = `${this.modificationsEnAttente.size} affectation(s) enregistrée(s)`;
      this.modificationsEnAttente.clear();
      this.chargerEtudiants();
      setTimeout(() => this.succes = '', 3000);
    }).catch(err => console.log(err));
  }
}