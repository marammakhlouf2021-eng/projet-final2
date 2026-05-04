import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionSemestresComponent } from './gestion-semestres.component';

describe('GestionSemestresComponent', () => {
  let component: GestionSemestresComponent;
  let fixture: ComponentFixture<GestionSemestresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionSemestresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GestionSemestresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
