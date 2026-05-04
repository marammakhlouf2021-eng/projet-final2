import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GererPComponent } from './gerer-p.component';

describe('GererPComponent', () => {
  let component: GererPComponent;
  let fixture: ComponentFixture<GererPComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GererPComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GererPComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
