import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploidutempsComponent } from './emploidutemps.component';

describe('EmploidutempsComponent', () => {
  let component: EmploidutempsComponent;
  let fixture: ComponentFixture<EmploidutempsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmploidutempsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmploidutempsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
