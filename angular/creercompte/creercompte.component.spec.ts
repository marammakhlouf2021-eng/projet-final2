import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreercompteComponent } from './creercompte.component';

describe('CreercompteComponent', () => {
  let component: CreercompteComponent;
  let fixture: ComponentFixture<CreercompteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreercompteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreercompteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
