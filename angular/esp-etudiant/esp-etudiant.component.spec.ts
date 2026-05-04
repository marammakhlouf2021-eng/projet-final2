import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspEtudiantComponent } from './esp-etudiant.component';

describe('EspEtudiantComponent', () => {
  let component: EspEtudiantComponent;
  let fixture: ComponentFixture<EspEtudiantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspEtudiantComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EspEtudiantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
