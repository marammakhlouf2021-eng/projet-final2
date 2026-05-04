import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GererEtudiantComponent } from './gerer-etudiant.component';

describe('GererEtudiantComponent', () => {
  let component: GererEtudiantComponent;
  let fixture: ComponentFixture<GererEtudiantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GererEtudiantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GererEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
