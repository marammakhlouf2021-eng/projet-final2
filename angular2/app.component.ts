import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';
import { CreercompteComponent } from './creercompte/creercompte.component';
import { AcceuilComponent } from './acceuil/acceuil.component';
import { BarreNavigationComponent } from './barre-navigation/barre-navigation.component';
import { ApiService } from './services/api.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,HeaderComponent,AcceuilComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'first-angular';
  message = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.test().subscribe((res: any) => {
      this.message = res.message;
    });
  }
}
