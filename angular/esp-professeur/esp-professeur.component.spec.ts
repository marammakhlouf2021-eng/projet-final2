import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspProfesseurComponent } from './esp-professeur.component';

describe('EspProfesseurComponent', () => {
  let component: EspProfesseurComponent;
  let fixture: ComponentFixture<EspProfesseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspProfesseurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EspProfesseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
