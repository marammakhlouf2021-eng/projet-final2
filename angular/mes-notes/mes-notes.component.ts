import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { SidebarEtudiantComponent } from '../sidebar-etudiant/sidebar-etudiant.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-mes-notes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule, SidebarEtudiantComponent],
  templateUrl: './mes-notes.component.html',
  styleUrl: './mes-notes.component.css'
})
export class MesNotesComponent implements OnInit {

  etudiant: any = null;
  notes: any[] = [];
  types = ['DS1', 'DS2', 'Examen', 'TP'];
  semestreActif: 'S1' | 'S2' = 'S1';
  semestreCloture: { S1: boolean, S2: boolean } = { S1: false, S2: false };

  constructor(private api: ApiService) {}

  ngOnInit() {
    const data = localStorage.getItem('etudiant');
    if (data) {
      this.etudiant = JSON.parse(data);
      this.chargerNotes();
      this.verifierSemestres();
    }
  }

  chargerNotes() {
    this.api.getNotesByEtudiant(this.etudiant._id).subscribe({
      next: (data: any) => this.notes = data,
      error: (err: any) => console.log(err)
    });
  }

  verifierSemestres() {
    const classeId = this.etudiant.classe?._id || this.etudiant.classe;
    this.api.getStatutSemestre(classeId, 'S1').subscribe({
      next: (data: any) => this.semestreCloture.S1 = data.cloture
    });
    this.api.getStatutSemestre(classeId, 'S2').subscribe({
      next: (data: any) => this.semestreCloture.S2 = data.cloture
    });
  }

  // Retourne la liste des matières du semestre actif (sans doublons)
  getMatieres(): any[] {
    const map: any = {};
    this.notes
      .filter(n => n.semestre === this.semestreActif)
      .forEach(n => {
        const id = n.matiere?._id || n.matiere;
        if (!map[id]) map[id] = n.matiere; // n.matiere contient l'objet complet grâce au populate
      });
    return Object.values(map);
  }

  // Retourne la note d'un type précis pour une matière
  getNoteParType(matiereId: string, type: string) {
    const note = this.notes.find(
      n => (n.matiere?._id || n.matiere) === matiereId
        && n.type === type
        && n.semestre === this.semestreActif
    );
    return note ? note.note : '—';
  }

  // Retourne les pourcentages de la matière (depuis la BDD) ou les valeurs par défaut
  getPourcentages(matiereId: string): any {
    const note = this.notes.find(
      n => (n.matiere?._id || n.matiere) === matiereId
        && n.semestre === this.semestreActif
    );
    // Si la matière est populée avec ses pourcentages, on les utilise
    // Sinon on utilise les valeurs par défaut du schema Mongoose
    return note?.matiere?.pourcentages || { DS1: 25, DS2: 25, Examen: 40, TP: 10 };
  }

  // Calcule la moyenne d'une matière avec ses propres pourcentages et coefficient
  getMoyenne(matiereId: string): string {
    // Bloqué si semestre non clôturé
    if (!this.semestreCloture[this.semestreActif as 'S1' | 'S2']) {
      return 'En cours...';
    }

    const notesMatiere = this.notes.filter(
      n => (n.matiere?._id || n.matiere) === matiereId
        && n.semestre === this.semestreActif
    );
    if (!notesMatiere.length) return '—';

    // Vérifier que les 4 types de notes sont saisis
    const typesRequis = ['DS1', 'DS2', 'Examen', 'TP'];
    const tousNotesSaisies = typesRequis.every(type =>
      notesMatiere.some(n => n.type === type)
    );
    if (!tousNotesSaisies) return 'Incomplet';

    // Utiliser les pourcentages propres à cette matière (depuis la BDD)
    const pourcentages = this.getPourcentages(matiereId);

    let total = 0;
    let totalPct = 0;
    notesMatiere.forEach((n: any) => {
      const pct = pourcentages[n.type] || 0;
      total += n.note * (pct / 100);
      totalPct += pct;
    });

    if (totalPct === 0) return '—';
    return (total / (totalPct / 100)).toFixed(2);
  }

  // Calcule la moyenne générale pondérée par les coefficients des matières
  getMoyenneGenerale(): string {
    // Bloqué si semestre non clôturé
    if (!this.semestreCloture[this.semestreActif as 'S1' | 'S2']) {
      return 'En attente de clôture';
    }

    const matieres = this.getMatieres();
    if (!matieres.length) return '—';

    // Calculer la moyenne de chaque matière avec son coefficient
    const moyennes = matieres.map(m => {
      const moy = this.getMoyenne(m._id || m);
      const coeff = m.coefficient || 1; // coefficient de la matière depuis la BDD
      return { valeur: moy, coeff };
    });

    // Bloqué si une matière a des notes incomplètes
    const toutesCompletes = moyennes.every(
      m => m.valeur !== '—' && m.valeur !== 'Incomplet' && m.valeur !== 'En cours...'
    );
    if (!toutesCompletes) return 'Notes incomplètes';

    // Formule : Σ(moyenne × coeff) / Σ(coefficients)
    let sommePonderee = 0;
    let sommeCoeffs = 0;
    moyennes.forEach(m => {
      sommePonderee += parseFloat(m.valeur) * m.coeff;
      sommeCoeffs += m.coeff;
    });

    if (sommeCoeffs === 0) return '—';
    return (sommePonderee / sommeCoeffs).toFixed(2);
  }
}