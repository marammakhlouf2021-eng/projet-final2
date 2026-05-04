import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesNotesComponent } from './mes-notes.component';

describe('MesNotesComponent', () => {
  let component: MesNotesComponent;
  let fixture: ComponentFixture<MesNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MesNotesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MesNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
