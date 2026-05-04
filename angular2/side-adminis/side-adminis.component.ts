import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-side-adminis',
  standalone: true,
    imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './side-adminis.component.html',
  styleUrl: './side-adminis.component.css'
})
export class SideAdminisComponent {

}
