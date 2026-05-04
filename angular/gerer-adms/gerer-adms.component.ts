import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { BarreNavigationComponent } from '../barre-navigation/barre-navigation.component';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gerer-adms',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, BarreNavigationComponent, CommonModule, FormsModule],
  templateUrl: './gerer-adms.component.html',
  styleUrl: './gerer-adms.component.css'
})
export class GererAdmsComponent implements OnInit {

  administrations: any[] = [];
  administrationModifier: any = null;
  showForm = false;
  erreurForm = '';
  successForm = '';
  nouvelleAdm = { email: '' };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.chargerAdministrations();
  }

  chargerAdministrations() {
    this.api.getAdministrations().subscribe({
      next: (data: any) => this.administrations = data,
      error: (err: any) => console.log(err)
    });
  }

  ajouter() {
    this.erreurForm = '';
    this.successForm = '';

    if (!this.nouvelleAdm.email) {
      this.erreurForm = "L'email est obligatoire";
      return;
    }

    this.api.verifierEmailExiste(this.nouvelleAdm.email).subscribe({
      next: (res: any) => {
        if (res.existe) {
          this.erreurForm = "Cet email est déjà utilisé dans le système";
          return;
        }

        this.api.inviterAdministration({ email: this.nouvelleAdm.email }).subscribe({
          next: () => {
            this.successForm = `Invitation envoyée à ${this.nouvelleAdm.email}`;
            this.nouvelleAdm = { email: '' };
            setTimeout(() => {
              this.showForm = false;
              this.successForm = '';
            }, 2000);
            this.chargerAdministrations();
          },
          error: (err: any) => {
            this.erreurForm = err.error?.message || "Erreur lors de l'envoi";
          }
        });
      },
      error: () => {
        this.erreurForm = "Erreur lors de la vérification de l'email";
      }
    });
  }

  supprimer(id: string) {
    if (confirm("Voulez-vous vraiment supprimer ?")) {
      this.api.deleteAdministration(id).subscribe({
        next: () => this.chargerAdministrations(),
        error: (err: any) => console.log(err)
      });
    }
  }

  modifier(adm: any) {
    this.administrationModifier = { ...adm };
  }

  enregistrerModification() {
    this.api.updateAdministration(this.administrationModifier._id, this.administrationModifier).subscribe({
      next: () => {
        this.administrationModifier = null;
        this.chargerAdministrations();
      },
      error: (err: any) => console.log(err)
    });
  }

  annuler() {
    this.administrationModifier = null;
  }
}