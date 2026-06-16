import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GgcLocationComponent } from "./ggc-location.component";
import { By } from "@angular/platform-browser";
import { GgcLocationService } from "../service/ggc-location.service";
import { vi } from "vitest";
describe("LocationComponent", () => {
  let component: GgcLocationComponent;
  let fixture: ComponentFixture<GgcLocationComponent>;
  let locationServiceSpy: MockedObject<GgcLocationService>;

  beforeEach(async () => {
    locationServiceSpy = {
      zoomToCurrentLocation: vi
        .fn()
        .mockName("LocationService.zoomToCurrentLocation")
    } as MockedObject<GgcLocationService>;
    await TestBed.configureTestingModule({
      imports: [GgcLocationComponent],
      providers: [{ provide: GgcLocationService, useValue: locationServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call zoomToCurrentLocation", () => {
    const button = fixture.debugElement.query(By.css(".fa-crosshairs"));

    button.nativeElement.click();

    expect(locationServiceSpy.zoomToCurrentLocation).toHaveBeenCalled();
  });
});
