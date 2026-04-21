import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerVectorTileComponent } from "./example-layer-vector-tile.component";

describe("ExampleLayerVectorTileComponent", () => {
  let component: ExampleLayerVectorTileComponent;
  let fixture: ComponentFixture<ExampleLayerVectorTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerVectorTileComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerVectorTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
