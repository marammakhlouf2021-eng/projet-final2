import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffectationsComponent } from './affectations.component';

describe('AffectationsComponent', () => {
  let component: AffectationsComponent;
  let fixture: ComponentFixture<AffectationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AffectationsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AffectationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
