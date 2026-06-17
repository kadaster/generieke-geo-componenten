import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GgcFoss4gMenuComponent } from './ggc-foss4g-menu.component';

describe('GgcFoss4gMenuComponent', () => {
  let component: GgcFoss4gMenuComponent;
  let fixture: ComponentFixture<GgcFoss4gMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GgcFoss4gMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GgcFoss4gMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
