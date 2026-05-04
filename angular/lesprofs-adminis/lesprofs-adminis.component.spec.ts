import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LesprofsAdminisComponent } from './lesprofs-adminis.component';

describe('LesprofsAdminisComponent', () => {
  let component: LesprofsAdminisComponent;
  let fixture: ComponentFixture<LesprofsAdminisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LesprofsAdminisComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LesprofsAdminisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

