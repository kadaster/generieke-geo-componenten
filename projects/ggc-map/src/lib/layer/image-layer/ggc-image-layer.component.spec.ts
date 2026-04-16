import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapService } from "../../map/service/core-map.service";
import { GgcImageLayerComponent } from "./ggc-image-layer.component";

describe("ImageLayerComponent", () => {
  let component: GgcImageLayerComponent;
  let fixture: ComponentFixture<GgcImageLayerComponent>;
  let debugElement: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GgcImageLayerComponent],
      providers: [CoreMapService, GgcCrsConfigService]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(GgcImageLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
