import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { BarreNavigationComponent } from '../barre-navigation/barre-navigation.component';

@Component({
  selector: 'app-demandes-comptes',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterModule,BarreNavigationComponent],
  templateUrl: './demandes-comptes.component.html',
  styleUrl: './demandes-comptes.component.css'
})
export class DemandesComptesComponent implements OnInit {

  demandes: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerDemandes();
  }

  chargerDemandes() {
    this.api.getDemandes().subscribe({
      next: (data: any) => this.demandes = data,
      error: (err: any) => console.log(err)
    });
  }

  accepter(id: string) {
  this.api.accepterDemande(id).subscribe({
    next: () => {
      alert("Compte créé avec succès !");
      this.chargerDemandes();
    },
    error: (err: any) => {
      if (err.status === 409 && err.error?.emailExiste) {
        // Email existe déjà — demander confirmation
        const confirmer = confirm(
          `${err.error.message}\n\nVoulez-vous quand même accepter cette demande ?`
        );
        if (confirmer) {
          // Accepter quand même
          this.api.accepterDemandeForce(id).subscribe({
            next: () => {
              alert("Compte créé !");
              this.chargerDemandes();
            },
            error: (err2: any) => console.log(err2)
          });
        } else {
          // Refuser et supprimer la demande
          this.api.refuserDemande(id).subscribe({
            next: () => {
              alert("Demande supprimée !");
              this.chargerDemandes();
            },
            error: (err2: any) => console.log(err2)
          });
        }
      } else {
        alert(err.error?.message || "Erreur lors de la création");
        console.log(err);
      }
    }
  });
}

  refuser(id: string) {
    if (confirm("Refuser cette demande ?")) {
      this.api.refuserDemande(id).subscribe({
        next: () => {
          alert("Demande refusée !");
          this.chargerDemandes();
        },
        error: (err: any) => console.log(err)
      });
    }
  }
}