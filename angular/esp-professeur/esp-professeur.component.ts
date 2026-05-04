import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarProfesseurComponent } from '../sidebar-professeur/sidebar-professeur.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-esp-professeur',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, SidebarProfesseurComponent],
  templateUrl: './esp-professeur.component.html',
  styleUrl: './esp-professeur.component.css'
})
export class EspProfesseurComponent implements OnInit {

  professeur: any = null;
  emplois: any[] = [];
  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  heures: string[] = [];

  constructor(private api: ApiService) {
    for (let h = 8; h <= 17; h++) {
      this.heures.push(`${h.toString().padStart(2, '0')}:00`);
      if (h < 17) this.heures.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  ngOnInit() {
    const data = localStorage.getItem('professeur');
    if (data) {
      this.professeur = JSON.parse(data);
      this.chargerEmploi();
    }
  }

  chargerEmploi() {
    this.api.getEmploiByProfesseur(this.professeur._id).subscribe({
      next: (data: any) => this.emplois = data,
      error: (err: any) => console.log(err)
    });
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
}