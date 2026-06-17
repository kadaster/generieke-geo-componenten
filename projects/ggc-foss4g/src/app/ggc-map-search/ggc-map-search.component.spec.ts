import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GgcMapSearchComponent } from './ggc-map-search.component';

describe('GgcMapSearchComponent', () => {
  let component: GgcMapSearchComponent;
  let fixture: ComponentFixture<GgcMapSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GgcMapSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GgcMapSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
