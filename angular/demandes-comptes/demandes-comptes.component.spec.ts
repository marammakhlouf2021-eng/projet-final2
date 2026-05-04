import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesComptesComponent } from './demandes-comptes.component';

describe('DemandesComptesComponent', () => {
  let component: DemandesComptesComponent;
  let fixture: ComponentFixture<DemandesComptesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesComptesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DemandesComptesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
