import type { MockedObject } from "vitest";
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CoreSelectionService } from "../../service/select/core-selection.service";
import { AbstractClickableLayer } from "./abstract-clickable-layer.directive";

@Component({ changeDetection: ChangeDetectionStrategy.Eager, template: "" })
class TestLayerComponent extends AbstractClickableLayer<any> {}

describe("AbstractClickableLayerComponent", () => {
  let component: TestLayerComponent;
  let coreSelectionServiceSpy: MockedObject<CoreSelectionService>;
  let fixture: ComponentFixture<TestLayerComponent>;

  beforeEach(async () => {
    coreSelectionServiceSpy = {
      handleFeatureInfoForLayer: vi
        .fn()
        .mockName("CoreSelectionServiceSpy.handleFeatureInfoForLayer")
    } as unknown as MockedObject<CoreSelectionService>;
    await TestBed.configureTestingModule({
      imports: [TestLayerComponent],
      providers: [
        { provide: CoreSelectionService, useValue: coreSelectionServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
