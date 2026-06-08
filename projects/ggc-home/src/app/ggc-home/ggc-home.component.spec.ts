import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  GgcLayerBrtAchtergrondkaartComponentMock,
  GgcMapComponentMock,
  GgcMapServiceMock,
  GgcLayerServiceMock
} from "../../../../../src/test/mocks/ggc/ggc-map";
import {
  GgcMapComponent,
  GgcMapService,
  GgcLayerService,
  GgcLayerBrtAchtergrondkaartComponent
} from "@kadaster/ggc-map";

import { GgcHomeComponent } from "./ggc-home.component";

describe("GgcHomeComponent", () => {
  let component: GgcHomeComponent;
  let fixture: ComponentFixture<GgcHomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GgcHomeComponent],
      providers: [
        { provide: GgcMapService, useClass: GgcMapServiceMock },
        { provide: GgcLayerService, useClass: GgcLayerServiceMock }
      ]
    })
      .overrideComponent(GgcHomeComponent, {
        remove: {
          imports: [GgcMapComponent, GgcLayerBrtAchtergrondkaartComponent]
        },
        add: {
          imports: [
            GgcMapComponentMock,
            GgcLayerBrtAchtergrondkaartComponentMock
          ]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(GgcHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
