import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesAbsencesComponent } from './mes-absences.component';

describe('MesAbsencesComponent', () => {
  let component: MesAbsencesComponent;
  let fixture: ComponentFixture<MesAbsencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesAbsencesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesAbsencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
