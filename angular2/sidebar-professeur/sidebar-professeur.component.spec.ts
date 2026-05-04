import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarProfesseurComponent } from './sidebar-professeur.component';

describe('SidebarProfesseurComponent', () => {
  let component: SidebarProfesseurComponent;
  let fixture: ComponentFixture<SidebarProfesseurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarProfesseurComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SidebarProfesseurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
