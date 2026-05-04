import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoirAbsencesComponent } from './voir-absences.component';

describe('VoirAbsencesComponent', () => {
  let component: VoirAbsencesComponent;
  let fixture: ComponentFixture<VoirAbsencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoirAbsencesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VoirAbsencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
