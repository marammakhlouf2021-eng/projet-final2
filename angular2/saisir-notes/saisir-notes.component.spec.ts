import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaisirNotesComponent } from './saisir-notes.component';

describe('SaisirNotesComponent', () => {
  let component: SaisirNotesComponent;
  let fixture: ComponentFixture<SaisirNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaisirNotesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SaisirNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
