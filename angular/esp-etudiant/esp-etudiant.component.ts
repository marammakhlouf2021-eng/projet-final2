import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarEtudiantComponent } from '../sidebar-etudiant/sidebar-etudiant.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-esp-etudiant',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, SidebarEtudiantComponent],
  templateUrl: './esp-etudiant.component.html',
  styleUrl: './esp-etudiant.component.css'
})
export class EspEtudiantComponent implements OnInit {

  etudiant: any = null;
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
  const data = localStorage.getItem('etudiant');
  if (data) {
    this.etudiant = JSON.parse(data);
    console.log('etudiant:', this.etudiant);
    console.log('classe:', this.etudiant.classe);

    // Recharger l'étudiant depuis le backend pour avoir la classe populée
    this.api.getEtudiants().subscribe({
      next: (etudiants: any) => {
        const found = etudiants.find((e: any) => e._id === this.etudiant._id);
        if (found) {
          this.etudiant = found;
          localStorage.setItem('etudiant', JSON.stringify(found));
          this.chargerEmploi();
        }
      },
      error: (err: any) => console.log(err)
    });
  }
}

chargerEmploi() {
  const classeId = this.etudiant.classe?._id || this.etudiant.classe;
  console.log('classeId utilisé:', classeId);
  if (!classeId) {
    console.log('Pas de classe trouvée');
    return;
  }
  this.api.getEmploiByClasse(classeId).subscribe({
    next: (data: any) => {
      console.log('emplois reçus:', data);
      this.emplois = data;
    },
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