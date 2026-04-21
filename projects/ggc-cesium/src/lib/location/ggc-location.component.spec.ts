import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GgcLocationComponent } from "./ggc-location.component";
import { By } from "@angular/platform-browser";
import { GgcLocationService } from "../service/ggc-location.service";
import SpyObj = jasmine.SpyObj;

describe("LocationComponent", () => {
  let component: GgcLocationComponent;
  let fixture: ComponentFixture<GgcLocationComponent>;
  let locationServiceSpy: SpyObj<GgcLocationService>;

  beforeEach(async () => {
    locationServiceSpy = jasmine.createSpyObj("LocationService", [
      "zoomToCurrentLocation"
    ]);
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
