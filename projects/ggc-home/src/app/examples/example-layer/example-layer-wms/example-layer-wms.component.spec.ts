import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerWmsComponent } from "./example-layer-wms.component";

describe("ExampleLayerWmsComponent", () => {
  let component: ExampleLayerWmsComponent;
  let fixture: ComponentFixture<ExampleLayerWmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerWmsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerWmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
