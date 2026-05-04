import { Component } from '@angular/core';

import { RouterModule } from '@angular/router';
import { RouterLink, RouterLinkActive } from '@angular/router';



@Component({
  selector: 'app-absence',
  standalone: true,
  imports: [RouterLink, RouterLinkActive,RouterModule],
  templateUrl: './absence.component.html',
  styleUrl: './absence.component.css'
})
export class AbsenceComponent {

}
