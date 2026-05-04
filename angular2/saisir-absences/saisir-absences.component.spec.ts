import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisirAbsencesComponent } from './saisir-absences.component';

describe('SaisirAbsencesComponent', () => {
  let component: SaisirAbsencesComponent;
  let fixture: ComponentFixture<SaisirAbsencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaisirAbsencesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisirAbsencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
