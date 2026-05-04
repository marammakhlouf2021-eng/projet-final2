import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GererAdmsComponent } from './gerer-adms.component';

describe('GererAdmsComponent', () => {
  let component: GererAdmsComponent;
  let fixture: ComponentFixture<GererAdmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GererAdmsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GererAdmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
