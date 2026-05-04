import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginProfesseurComponent } from './login-professeur.component';

describe('LoginProfesseurComponent', () => {
  let component: LoginProfesseurComponent;
  let fixture: ComponentFixture<LoginProfesseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginProfesseurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoginProfesseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
