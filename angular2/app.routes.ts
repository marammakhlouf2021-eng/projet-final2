import { Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { AcceuilComponent } from './acceuil/acceuil.component';
import { LoginComponent } from './login/login.component';
import { CreercompteComponent } from './creercompte/creercompte.component';
import { BarreNavigationComponent } from './barre-navigation/barre-navigation.component';
import { DemandesComptesComponent } from './demandes-comptes/demandes-comptes.component';
import { AbsenceComponent } from './absence/absence.component';
import { AdminComponent } from './admin/admin.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { GererPComponent } from './gerer-p/gerer-p.component';
import { EspAdminisComponent } from './esp-adminis/esp-adminis.component';
import { SideAdminisComponent } from './side-adminis/side-adminis.component';
import { GererAdmsComponent } from './gerer-adms/gerer-adms.component';
import { GererEtudiantComponent } from './gerer-etudiant/gerer-etudiant.component';
import { LesclassesComponent } from './lesclasses/lesclasses.component';
import { LesetudiantsComponent } from './lesetudiants/lesetudiants.component';
import { AffectationsComponent } from './affectations/affectations.component';
import { LesprofsAdminisComponent } from './lesprofs-adminis/lesprofs-adminis.component';
import { EmploidutempsComponent } from './emploidutemps/emploidutemps.component';
import { LoginProfesseurComponent } from './login-professeur/login-professeur.component';
import { EspProfesseurComponent } from './esp-professeur/esp-professeur.component';
import { SaisirNotesComponent } from './saisir-notes/saisir-notes.component';
import { SaisirAbsencesComponent } from './saisir-absences/saisir-absences.component';
import { VoirAbsencesComponent } from './voir-absences/voir-absences.component';
import { LoginEtudiantComponent } from './login-etudiant/login-etudiant.component';
import { EspEtudiantComponent } from './esp-etudiant/esp-etudiant.component';
import { MesNotesComponent } from './mes-notes/mes-notes.component';
import { MesAbsencesComponent } from './mes-absences/mes-absences.component';
import { LoginAdminisComponent } from './login-adminis/login-adminis.component';
import { GestionSemestresComponent } from './gestion-semestres/gestion-semestres.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { CompleterProfilComponent } from './completer-profil/completer-profil.component';

// Dans le tableau routes, ajoute :

export const routes: Routes = [

  // ── Pages publiques (pas de guard) ──
  { path: '', component: AcceuilComponent, pathMatch: 'full' },
  { path: 'creercompte', component: CreercompteComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'login-professeur', component: LoginProfesseurComponent },
  { path: 'login-etudiant', component: LoginEtudiantComponent },
  { path: 'login-adminis', component: LoginAdminisComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'barre-navigation', component: BarreNavigationComponent },
  { path: 'side-adminis', component: SideAdminisComponent },

  // ── Espace Admin ──
  { path: 'gerer-p', component: GererPComponent,
    canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'gerer-adms', component: GererAdmsComponent,
    canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'gerer-etudiant', component: GererEtudiantComponent,
    canActivate: [AuthGuard], data: { role: 'admin' } },
  { path: 'demandes-comptes', component: DemandesComptesComponent,
    canActivate: [AuthGuard], data: { role: 'admin' } },

  // ── Espace Administration ──
  { path: 'esp-adminis', component: EspAdminisComponent,
    canActivate: [AuthGuard], data: { role: 'administration' } },
  { path: 'lesclasses', component: LesclassesComponent,
    canActivate: [AuthGuard], data: { role: 'administration' } },
  { path: 'lesetudiants', component: LesetudiantsComponent,
    canActivate: [AuthGuard], data: { role: 'administration' } },
  { path: 'affectations', component: AffectationsComponent,
    canActivate: [AuthGuard], data: { role: 'administration' } },
  { path: 'emploidutemps', component: EmploidutempsComponent,
    canActivate: [AuthGuard], data: { role: 'administration' } },
  { path: 'lesprofs-adminis', component: LesprofsAdminisComponent,
    canActivate: [AuthGuard], data: { role: 'administration' } },
  { path: 'gestion-semestres', component: GestionSemestresComponent,
    canActivate: [AuthGuard], data: { role: 'administration' } },
  { path: 'chatbot', component: ChatbotComponent,
    canActivate: [AuthGuard], data: { role: 'administration' } },

  // ── Espace Professeur ──
  { path: 'esp-professeur', component: EspProfesseurComponent,
    canActivate: [AuthGuard], data: { role: 'professeur' } },
  { path: 'saisir-notes', component: SaisirNotesComponent,
    canActivate: [AuthGuard], data: { role: 'professeur' } },
  { path: 'saisir-absences', component: SaisirAbsencesComponent,
    canActivate: [AuthGuard], data: { role: 'professeur' } },
  { path: 'voir-absences', component: VoirAbsencesComponent,
    canActivate: [AuthGuard], data: { role: 'professeur' } },

  // ── Espace Étudiant ──
  { path: 'esp-etudiant', component: EspEtudiantComponent,
    canActivate: [AuthGuard], data: { role: 'etudiant' } },
  { path: 'mes-notes', component: MesNotesComponent,
    canActivate: [AuthGuard], data: { role: 'etudiant' } },
  { path: 'mes-absences', component: MesAbsencesComponent,
    canActivate: [AuthGuard], data: { role: 'etudiant' } },
  { path: 'absence', component: AbsenceComponent,
    canActivate: [AuthGuard], data: { role: 'etudiant' } },
  

  { path: 'creer-compte', component: CompleterProfilComponent },
];