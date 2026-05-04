import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LesclassesComponent } from './lesclasses.component';

describe('LesclassesComponent', () => {
  let component: LesclassesComponent;
  let fixture: ComponentFixture<LesclassesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LesclassesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LesclassesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
