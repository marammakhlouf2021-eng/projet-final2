import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideAdminisComponent } from '../side-adminis/side-adminis.component';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-lesclasses',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, SideAdminisComponent, CommonModule, FormsModule],
  templateUrl: './lesclasses.component.html',
  styleUrl: './lesclasses.component.css'
})
export class LesclassesComponent implements OnInit {

  classes: any[] = [];
  professeurs: any[] = [];
  toutesLesMatieres: any[] = [];
  matieresByClasse: any = {};
  modifEnCours: any = {};
  modifData: any = {};

  showFormClasse = false;
  showFormMatiereClasse: any = {};

  modifMatiereEnCours: any = {};
 modifMatiereData: any = {};

  activeTab: 'classes' | 'matieres' = 'classes';

  // Formulaire nouvelle classe
  nouvelleClasse = { nom: '', niveau: '', specialite: '', groupe: '' };
  erreurClasse = '';

  // Formulaire nouvelle matière (indépendante)
  showFormMatiere = false;
  nouvelleMatiere = {
    nom: '',
    profsAutorises: [] as string[],
    pourcentages: { DS1: 25, DS2: 25, Examen: 40, TP: 10 }
  };

  // Formulaire ajouter matière à une classe
  matiereSelectionneeId: string = '';
  coefficientSelectionne: number = 1;

  niveaux = ['1ere', '2eme', '3eme', '4eme'];
  specialites = ['informatique', 'lettres', 'science', 'technique', 'math'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerClasses();
    this.chargerProfesseurs();
    this.chargerToutesLesMatieres();
  }

  chargerClasses() {
    this.api.getClasses().subscribe((data: any) => {
      this.classes = data;
      data.forEach((cls: any) => this.chargerMatieres(cls._id));
    });
  }

  chargerMatieres(classeId: string) {
    this.api.getMatieresByClasse(classeId).subscribe((data: any) => {
      this.matieresByClasse[classeId] = data;
    });
  }

  chargerProfesseurs() {
    this.api.getProfesseurs().subscribe((data: any) => {
      this.professeurs = data;
    });
  }

  chargerToutesLesMatieres() {
    this.api.getMatieres().subscribe((data: any) => {
      this.toutesLesMatieres = data;
    });
  }

  // Matières non encore assignées à cette classe
  getMatieresDisponibles(classeId: string): any[] {
    const assignees = (this.matieresByClasse[classeId] || []).map((m: any) => m._id);
    return this.toutesLesMatieres.filter(m => !assignees.includes(m._id));
  }

  getCoefficientDansClasse(mat: any, classeId: string): number {
    const entry = mat.classes?.find((c: any) => (c.classe?._id || c.classe) === classeId);
    return entry?.coefficient || 1;
  }

  // Ajouter classe avec vérification doublon
ajouterClasse() {

  this.erreurClasse = '';

  // Vérification champs obligatoires
  if (!this.nouvelleClasse.niveau || !this.nouvelleClasse.groupe) {
    this.erreurClasse = "Niveau et groupe obligatoires";
    return;
  }

  // Groupe = 1 lettre majuscule
  this.nouvelleClasse.groupe =
    this.nouvelleClasse.groupe.charAt(0).toUpperCase();

  // Spécialité obligatoire pour 2/3/4
  if (this.nouvelleClasse.niveau !== '1ere' && !this.nouvelleClasse.specialite) {
    this.erreurClasse = "Spécialité obligatoire pour ce niveau";
    return;
  }

  // Générer le nom automatiquement
  const niveauNum = this.nouvelleClasse.niveau
    .replace('ere', '')
    .replace('eme', '');

  const spec = this.nouvelleClasse.specialite
    ? this.nouvelleClasse.specialite.substring(0, 4)
    : '';

  const nomGenere = `${niveauNum} ${spec} ${this.nouvelleClasse.groupe}`.trim();

  // Construire objet à envoyer (IMPORTANT)
  const data: any = {
    niveau: this.nouvelleClasse.niveau,
    groupe: this.nouvelleClasse.groupe,
    nom: nomGenere
  };

  // Ajouter spécialité seulement si nécessaire
  if (this.nouvelleClasse.niveau !== '1ere') {
    data.specialite = this.nouvelleClasse.specialite;
  }

  // Envoi vers backend
  this.api.addClasse(data).subscribe({
    next: () => {
      this.nouvelleClasse = {
        nom: '',
        niveau: '',
        specialite: '',
        groupe: ''
      };
      this.showFormClasse = false;
      this.chargerClasses();
    },
    error: (err) => {
      this.erreurClasse = err.error?.message || "Erreur lors de l'ajout";
    }
  });
}
  supprimerClasse(id: string) {
    if (confirm("Supprimer cette classe ?")) {
      this.api.deleteClasse(id).subscribe(() => this.chargerClasses());
    }
  }

  // Ajouter matière indépendante
 ajouterMatiere() {

  if (!this.nouvelleMatiere.nom) {
    alert("Nom obligatoire");
    return;
  }

  const data = {
    nom: this.nouvelleMatiere.nom.toLowerCase(), 
    profsAutorises: this.nouvelleMatiere.profsAutorises,
    pourcentages: this.nouvelleMatiere.pourcentages
  };

  this.api.addMatiere(data).subscribe({
    next: () => {
      this.nouvelleMatiere = {
        nom: '',
        profsAutorises: [],
        pourcentages: { DS1: 25, DS2: 25, Examen: 40, TP: 10 }
      };
      this.chargerToutesLesMatieres();
    },
    error: (err) => console.log(err)
  });
}

  toggleProfAutorise(id: string) {
    const index = this.nouvelleMatiere.profsAutorises.indexOf(id);
    if (index === -1) this.nouvelleMatiere.profsAutorises.push(id);
    else this.nouvelleMatiere.profsAutorises.splice(index, 1);
  }

  // Ajouter matière existante à une classe
  ajouterMatiereAClasse(classeId: string) {
    if (!this.matiereSelectionneeId) {
      alert("Choisissez une matière");
      return;
    }
    this.api.addClasseToMatiere(this.matiereSelectionneeId, classeId, this.coefficientSelectionne).subscribe({
      next: () => {
        this.matiereSelectionneeId = '';
        this.coefficientSelectionne = 1;
        this.showFormMatiereClasse[classeId] = false;
        this.chargerMatieres(classeId);
        this.chargerToutesLesMatieres();
      },
      error: (err: any) => alert(err.error?.message || "Erreur")
    });
  }

  retirerMatiereDeClasse(matiereId: string, classeId: string) {
    if (confirm("Retirer cette matière de la classe ?")) {
      this.api.removeClasseFromMatiere(matiereId, classeId).subscribe({
        next: () => {
          this.chargerMatieres(classeId);
          this.chargerToutesLesMatieres();
        }
      });
    }
  }

  supprimerMatiere(id: string) {
    if (confirm("Supprimer définitivement cette matière ?")) {
      this.api.deleteMatiere(id).subscribe(() => {
        this.chargerToutesLesMatieres();
        this.classes.forEach(cls => this.chargerMatieres(cls._id));
      });
    }
  }
  formaterGroupe() {
  if (this.nouvelleClasse.groupe) {
    this.nouvelleClasse.groupe =
      this.nouvelleClasse.groupe.charAt(0).toUpperCase();
  }
}
getProfAssigne(mat: any, classeId: string): string {
  const entry = mat.classes?.find((c: any) => (c.classe?._id || c.classe) === classeId);
  if (!entry || !entry.profId) return 'Non assigné';
  const prof = mat.profsAutorises?.find((p: any) => p._id === (entry.profId?._id || entry.profId));
  return prof ? `${prof.nom} ${prof.prenom}` : 'Non assigné';
}

ouvrirModif(mat: any, classeId: string) {
  const key = `${mat._id}_${classeId}`;
  this.modifEnCours[key] = true;
  const entry = mat.classes?.find((c: any) => (c.classe?._id || c.classe) === classeId);
  this.modifData[key] = {
    coefficient: entry?.coefficient || 1,
    profId: entry?.profId?._id || entry?.profId || ''
  };
}

enregistrerModif(matiereId: string, classeId: string) {
  const key = `${matiereId}_${classeId}`;
  const data = this.modifData[key];
  this.api.updateMatiereClasse(matiereId, classeId, data.coefficient, data.profId).subscribe({
    next: () => {
      this.modifEnCours[key] = false;
      this.chargerMatieres(classeId);
      this.chargerToutesLesMatieres();
    },
    error: (err: any) => alert(err.error?.message || 'Erreur')
  });
}
ouvrirModifMatiere(mat: any) {
  this.modifMatiereEnCours[mat._id] = true;
  this.modifMatiereData[mat._id] = {
    nom: mat.nom,
    profsAutorises: mat.profsAutorises.map((p: any) => p._id)
  };
}

toggleProfModif(matiereId: string, profId: string) {
  const liste = this.modifMatiereData[matiereId].profsAutorises;
  const index = liste.indexOf(profId);
  if (index === -1) liste.push(profId);
  else liste.splice(index, 1);
}

enregistrerModifMatiere(matiereId: string) {
  const data = this.modifMatiereData[matiereId];
  this.api.updateMatiere(matiereId, {
    nom: data.nom.toLowerCase().trim(),
    profsAutorises: data.profsAutorises
  }).subscribe({
    next: () => {
      this.modifMatiereEnCours[matiereId] = false;
      this.chargerToutesLesMatieres();
      this.classes.forEach(cls => this.chargerMatieres(cls._id));
    },
    error: (err: any) => alert(err.error?.message || 'Erreur')
  });
}
}