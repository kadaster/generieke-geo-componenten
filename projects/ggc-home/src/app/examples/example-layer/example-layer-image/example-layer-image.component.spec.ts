import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerImageComponent } from "./example-layer-image.component";

describe("ExampleLayerImageComponent", () => {
  let component: ExampleLayerImageComponent;
  let fixture: ComponentFixture<ExampleLayerImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerImageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
