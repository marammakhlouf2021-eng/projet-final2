import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SideAdminisComponent } from '../side-adminis/side-adminis.component';
import { ApiService } from '../services/api.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-esp-adminis',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule, FormsModule, SideAdminisComponent],
  templateUrl: './esp-adminis.component.html',
  styleUrl: './esp-adminis.component.css'
})
export class EspAdminisComponent implements OnInit {

  @ViewChild('absenceChart') absenceChartRef!: ElementRef;
  @ViewChild('moyenneChart') moyenneChartRef!: ElementRef;

  stats: any = null;
  classeSelectionnee: any = null;
  classeSelectionneeId: string = '';
  absenceChart: any = null;
  moyenneChart: any = null;
  ranking: any[] = [];
  etudiantsRisque: any[] = [];
  topEtudiants: any[] = [];
  resultatsClasse: any = null;
  moyennesParMatiere: any[] = [];
  barColors = ['#7F77DD','#378ADD','#1D9E75','#D4537E','#E24B4A','#BA7517'];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getDashboardStats().subscribe({
      next: (data: any) => this.stats = data,
      error: (err: any) => console.log(err)
    });

    this.api.getEtudiantsRisque().subscribe({
      next: (data: any) => this.etudiantsRisque = data,
      error: (err: any) => console.log(err)
    });
  }

  onClasseChange() {
    const classeId = this.classeSelectionneeId;

    if (!classeId) {
      this.classeSelectionnee = null;
      this.topEtudiants = [];
      this.resultatsClasse = null;
      this.moyennesParMatiere = [];
      if (this.absenceChart) { this.absenceChart.destroy(); this.absenceChart = null; }
      if (this.moyenneChart) { this.moyenneChart.destroy(); this.moyenneChart = null; }
      return;
    }

    // Détails classe
    this.api.getClasseDetail(classeId).subscribe({
      next: (data: any) => {
        this.classeSelectionnee = data;
        const absencesClasse = this.stats.absencesParMatiere.filter(
          (a: any) => a.classeId?.toString() === classeId
        );
        setTimeout(() => {
          this.creerGraphiqueAbsences(
            absencesClasse.length > 0 ? absencesClasse.map((a: any) => a.matiere) : ['Aucune absence'],
            absencesClasse.length > 0 ? absencesClasse.map((a: any) => a.count) : [0]
          );
        }, 100);
      },
      error: (err: any) => console.log(err)
    });

    // Top étudiants + résultats + moyennes par matière
    this.api.getTopEtudiants(classeId).subscribe({
      next: (data: any) => {
        this.topEtudiants = data.top5;
        this.resultatsClasse = data;
        this.moyennesParMatiere = data.moyennesParMatiere;

        if (data.moyennesParMatiere?.length > 0) {
          setTimeout(() => {
            if (this.moyenneChart) this.moyenneChart.destroy();
            this.moyenneChart = new Chart(this.moyenneChartRef.nativeElement, {
              type: 'bar',
              data: {
                labels: data.moyennesParMatiere.map((m: any) => m.matiere),
                datasets: [{
                  label: 'Moyenne / 20',
                  data: data.moyennesParMatiere.map((m: any) => parseFloat(m.moyenne)),
                  backgroundColor: data.moyennesParMatiere.map((_: any, i: number) =>
                    this.barColors[i % this.barColors.length] + '99'
                  ),
                  borderColor: data.moyennesParMatiere.map((_: any, i: number) =>
                    this.barColors[i % this.barColors.length]
                  ),
                  borderWidth: 1.5,
                  borderRadius: 6
                }]
              },
              options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                  y: { min: 0, max: 20, grid: { color: 'rgba(0,0,0,0.05)' } },
                  x: { grid: { display: false } }
                }
              }
            });
          }, 200);
        }
      },
      error: (err: any) => console.log(err)
    });
  }

  calculerMoyennesParMatiere(classeId: string) {
    // Utiliser les données existantes depuis le ranking
    this.api.getAbsencesRanking().subscribe({
      next: (rankingData: any) => {
        const classeRanking = rankingData.find(
          (r: any) => r.classeId?.toString() === classeId
        );
        if (!classeRanking) return;

        // Pour le graphique des moyennes, utiliser les notes du top5
        if (this.topEtudiants.length > 0) {
          setTimeout(() => this.creerGraphiqueMoyennes(classeId), 200);
        }
      }
    });
  }

  creerGraphiqueMoyennes(classeId: string) {
    // Récupérer les absences par matière pour cette classe (triées)
    const absClasse = this.stats?.absencesParMatiere
      ?.filter((a: any) => a.classeId?.toString() === classeId)
      ?.sort((a: any, b: any) => b.count - a.count) || [];

    if (absClasse.length === 0 || !this.moyenneChartRef) return;

    if (this.moyenneChart) this.moyenneChart.destroy();

    this.moyenneChart = new Chart(this.moyenneChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: absClasse.map((a: any) => a.matiere),
        datasets: [{
          label: 'Absences (+ = matière problématique)',
          data: absClasse.map((a: any) => a.count),
          backgroundColor: absClasse.map((_: any, i: number) =>
            this.barColors[i % this.barColors.length] + '99'
          ),
          borderColor: absClasse.map((_: any, i: number) =>
            this.barColors[i % this.barColors.length]
          ),
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        indexAxis: 'y' as const,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 12 } } },
          y: { grid: { display: false }, ticks: { font: { size: 12 } } }
        }
      }
    });

    this.moyennesParMatiere = absClasse;
  }

  creerGraphiqueAbsences(labels: string[], data: number[]) {
    if (this.absenceChart) this.absenceChart.destroy();
    this.absenceChart = new Chart(this.absenceChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Absences',
          data,
          backgroundColor: '#ef444499',
          borderColor: '#ef4444',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  getRisqueClasse(classeNom: string) {
    return this.etudiantsRisque.find(r => r.classe === classeNom);
  }

getMoyenneLabel(moy: string | null): string {
    if (!moy) return '—';
    const val = parseFloat(moy);
    if (val >= 16) return moy + ' / 20';
    if (val >= 12) return moy + ' / 20';
    if (val >= 10) return moy + ' / 20';
    return moy + ' / 20';
  }

  getRang(index: number): string {
    if (index === 0) return '1er';
    if (index === 1) return '2ème';
    if (index === 2) return '3ème';
    return (index + 1) + 'ème';
  }
  getPercent(val: number, type: 'etu' | 'abs'): number {
    if (!this.stats) return 0;
    const arr = type === 'etu'
      ? this.stats.etudiantsParClasse.map((e: any) => e.count)
      : this.stats.absencesParClasse.map((a: any) => a.count);
    return Math.round((val / Math.max(...arr, 1)) * 100);
  }
}