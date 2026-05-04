import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EspAdminisComponent } from './esp-adminis.component';

describe('EspAdminisComponent', () => {
  let component: EspAdminisComponent;
  let fixture: ComponentFixture<EspAdminisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EspAdminisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EspAdminisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
