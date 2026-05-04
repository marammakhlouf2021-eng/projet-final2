import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  test() {
    return this.http.get(`${this.baseUrl}/api/test`);
  }

  login(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  // ==================== PROFESSEURS ====================
  getProfesseurs() {
    return this.http.get(`${this.baseUrl}/get-professeurs`);
  }
  addProfesseur(data: any) {
    return this.http.post(`${this.baseUrl}/add-professeur`, data);
  }
  updateProfesseur(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/update-professeur/${id}`, data);
  }
  deleteProfesseur(id: string) {
    return this.http.delete(`${this.baseUrl}/delete-professeur/${id}`);
  }
  affecterMatieresProf(id: string, matieres: string[]) {
    return this.http.put(`${this.baseUrl}/affecter-matieres-prof/${id}`, { matieres });
  }

  // ==================== ADMINISTRATIONS ====================
  getAdministrations() {
    return this.http.get(`${this.baseUrl}/get-administrations`);
  }
  deleteAdministration(id: string) {
    return this.http.delete(`${this.baseUrl}/delete-administration/${id}`);
  }
  updateAdministration(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/update-administration/${id}`, data);
  }

  // ==================== ETUDIANTS ====================
  getEtudiants() {
    return this.http.get(`${this.baseUrl}/get-etudiants`);
  }
  addEtudiant(data: any) {
    return this.http.post(`${this.baseUrl}/add-etudiant`, data);
  }
  updateEtudiant(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/update-etudiant/${id}`, data);
  }
  deleteEtudiant(id: string) {
    return this.http.delete(`${this.baseUrl}/delete-etudiant/${id}`);
  }
  affecterEtudiantClasse(id: string, classeId: string) {
    return this.http.put(`${this.baseUrl}/affecter-etudiant-classe/${id}`, { classe: classeId });
  }

  // ==================== CLASSES ====================
  getClasses() {
    return this.http.get(`${this.baseUrl}/get-classes`);
  }
  addClasse(data: any) {
    return this.http.post(`${this.baseUrl}/add-classe`, data);
  }
  updateClasse(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/update-classe/${id}`, data);
  }
  deleteClasse(id: string) {
    return this.http.delete(`${this.baseUrl}/delete-classe/${id}`);
  }

  // ==================== MATIERES ====================
  getMatieres() {
    return this.http.get(`${this.baseUrl}/get-matieres`);
  }
  getMatieresByClasse(classeId: string) {
    return this.http.get(`${this.baseUrl}/get-matieres-by-classe/${classeId}`);
  }
  addMatiere(data: any) {
    return this.http.post(`${this.baseUrl}/add-matiere`, data);
  }
  updateMatiere(id: string, data: any) {
    return this.http.put(`${this.baseUrl}/update-matiere/${id}`, data);
  }
  deleteMatiere(id: string) {
    return this.http.delete(`${this.baseUrl}/delete-matiere/${id}`);
  }



// Emploi du temps
addEmploi(data: any) {
  return this.http.post(`${this.baseUrl}/add-emploi`, data);
}
getEmploiByClasse(classeId: string) {
  return this.http.get(`${this.baseUrl}/get-emploi-by-classe/${classeId}`);
}
deleteEmploi(id: string) {
  return this.http.delete(`${this.baseUrl}/delete-emploi/${id}`);
}


loginProfesseur(data: any) {
  return this.http.post(`${this.baseUrl}/login-professeur`, data);
}
getEmploiByProfesseur(profId: string) {
  return this.http.get(`${this.baseUrl}/get-emploi-by-professeur/${profId}`);
}


// Notes
addNote(data: any) {
  return this.http.post(`${this.baseUrl}/add-note`, data);
}
getNotesByMatiere(matiereId: string) {
  return this.http.get(`${this.baseUrl}/get-notes-by-matiere/${matiereId}`);
}

// Absences
addAbsence(data: any) {
  return this.http.post(`${this.baseUrl}/add-absence`, data);
}
getAbsencesByMatiere(matiereId: string) {
  return this.http.get(`${this.baseUrl}/get-absences-by-matiere/${matiereId}`);
}


getAbsencesBySeance(matiereId: string, date: string) {
  return this.http.get(`${this.baseUrl}/get-absences-by-seance/${matiereId}/${date}`);
}
updateAbsence(id: string, data: any) {
  return this.http.put(`${this.baseUrl}/update-absence/${id}`, data);
}
deleteAbsence(id: string) {
  return this.http.delete(`${this.baseUrl}/delete-absence/${id}`);
}

getAbsencesByClasse(classeId: string, date: string) {
  return this.http.get(`${this.baseUrl}/get-absences-by-classe/${classeId}/${date}`);
}

updateMatieresAutorisees(id: string, matieres: string[]) {
  return this.http.put(`${this.baseUrl}/update-matieres-autorisees/${id}`, { matieresAutorisees: matieres });
}
updateProfsAutorises(id: string, profs: string[]) {
  return this.http.put(`${this.baseUrl}/update-profs-autorises/${id}`, { profsAutorises: profs });
}
getMatieresSansClasse() {
  return this.http.get(`${this.baseUrl}/get-matieres-sans-classe`);
}

addAdministration(data: any) {
  return this.http.post(`${this.baseUrl}/add-administration`, data);
}
loginEtudiant(data: any) {
  return this.http.post(`${this.baseUrl}/login-etudiant`, data);
}
getNotesByEtudiant(etudiantId: string) {
  return this.http.get(`${this.baseUrl}/get-notes-by-etudiant/${etudiantId}`);
}
getAbsencesByEtudiant(etudiantId: string) {
  return this.http.get(`${this.baseUrl}/get-absences-by-etudiant/${etudiantId}`);
}


forgotPasswordProfesseur(email: string) {
  return this.http.post(`${this.baseUrl}/forgot-password-professeur`, { email });
}
forgotPasswordEtudiant(email: string) {
  return this.http.post(`${this.baseUrl}/forgot-password-etudiant`, { email });
}

loginAdministration(data: any) {
  return this.http.post(`${this.baseUrl}/login-administration`, data);
}
forgotPasswordAdministration(email: string) {
  return this.http.post(`${this.baseUrl}/forgot-password-administration`, { email });
}

addDemande(data: any) {
  return this.http.post(`${this.baseUrl}/add-demande`, data);
}
getDemandes() {
  return this.http.get(`${this.baseUrl}/get-demandes`);
}
accepterDemande(id: string) {
  return this.http.put(`${this.baseUrl}/accepter-demande/${id}`, {});
}
refuserDemande(id: string) {
  return this.http.put(`${this.baseUrl}/refuser-demande/${id}`, {});
}

cloturerSemestre(classeId: string, semestre: string) {
  return this.http.post(`${this.baseUrl}/cloturer-semestre`, { classeId, semestre });
}
getStatutSemestre(classeId: string, semestre: string) {
  return this.http.get(`${this.baseUrl}/get-statut-semestre/${classeId}/${semestre}`);
}
getSemestres() {
  return this.http.get(`${this.baseUrl}/get-semestres`);
}

getDashboardStats(): Observable<any> {
  return this.http.get(`${this.baseUrl}/get-dashboard-stats`);
}

getClasseDetail(classeId: string): Observable<any> {
  return this.http.get(`${this.baseUrl}/get-classe-detail/${classeId}`);
}


resetPassword(token: string, newPassword: string) {
  return this.http.post(`${this.baseUrl}/reset-password`, { token, newPassword });
}


forgotPasswordAdmin(email: string) {
  return this.http.post(`${this.baseUrl}/forgot-password-admin`, { email });
}

decloturerSemestre(classeId: string, semestre: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/decloturer-semestre`, { classeId, semestre });
}

getAbsencesRanking(): Observable<any> {
  return this.http.get(`${this.baseUrl}/get-absences-ranking`);
}

getEtudiantsRisque(): Observable<any> {
  return this.http.get(`${this.baseUrl}/get-etudiants-risque`);
}
getTopEtudiants(classeId: string) {
  return this.http.get(`${this.baseUrl}/get-top-etudiants/${classeId}`);
}
accepterDemandeForce(id: string) {
  return this.http.put(`${this.baseUrl}/accepter-demande-force/${id}`, {});
}
checkClasse(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/check-classe`, data);
}

addClasseToMatiere(matiereId: string, classeId: string, coefficient: number): Observable<any> {
  return this.http.put(`${this.baseUrl}/add-classe-to-matiere/${matiereId}`, { classeId, coefficient });
}

removeClasseFromMatiere(matiereId: string, classeId: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/remove-classe-from-matiere/${matiereId}`, { classeId });
}
updateMatiereClasse(matiereId: string, classeId: string, coefficient: number, profId: string) {
  return this.http.put(`${this.baseUrl}/update-matiere-classe/${matiereId}`, {
    classeId, coefficient, profId
  });
}
verifierEmailExiste(email: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/verifier-email`, { email });
}

inviterProfesseur(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/inviter-professeur`, data);
}
verifierTokenInvitation(token: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/verifier-token-invitation`, { token });
}

completerProfil(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/completer-profil`, data);
}
inviterEtudiant(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/inviter-etudiant`, data);
}
inviterAdministration(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/inviter-administration`, data);
}
}