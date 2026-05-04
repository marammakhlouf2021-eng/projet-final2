import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LesetudiantsComponent } from './lesetudiants.component';

describe('LesetudiantsComponent', () => {
  let component: LesetudiantsComponent;
  let fixture: ComponentFixture<LesetudiantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LesetudiantsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LesetudiantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
