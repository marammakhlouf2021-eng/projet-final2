import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideAdminisComponent } from './side-adminis.component';

describe('SideAdminisComponent', () => {
  let component: SideAdminisComponent;
  let fixture: ComponentFixture<SideAdminisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideAdminisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SideAdminisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
