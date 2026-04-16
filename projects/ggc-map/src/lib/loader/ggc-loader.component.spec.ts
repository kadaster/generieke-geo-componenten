import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReplaySubject } from "rxjs";
import { CoreMapEventsService } from "../map/service/core-map-events.service";

import { GgcLoaderComponent } from "./ggc-loader.component";

describe("LoaderComponent", () => {
  let component: GgcLoaderComponent;
  let fixture: ComponentFixture<GgcLoaderComponent>;
  let mapEventService: CoreMapEventsService;
  let loadingSubject: ReplaySubject<boolean>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GgcLoaderComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcLoaderComponent);
    component = fixture.componentInstance;
    mapEventService = TestBed.inject(CoreMapEventsService);
    fixture.detectChanges();
    loadingSubject = new ReplaySubject<boolean>();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should subscribe when the mapIndex is set", () => {
    spyOn(mapEventService, "getLoadingObservableForMap").and.returnValue(
      loadingSubject
    );
    component.mapIndex = "loading-map";
    expect(component["isLoading"]).toBeFalsy();
    loadingSubject.next(true);
    expect(component["isLoading"]).toBeTruthy();
  });

  it("should unsubscribe on destroy", () => {
    spyOn(mapEventService, "getLoadingObservableForMap").and.returnValue(
      loadingSubject
    );
    loadingSubject.next(true);
    component.mapIndex = "loading-map";
    expect(component["isLoading"]).toBeTruthy();
    component.ngOnDestroy();

    loadingSubject.next(false);
    // should not be updated, already unsubscribed
    expect(component["isLoading"]).toBeTruthy();
  });

  it("should unsubscribe on mapIndex change", () => {
    spyOn(mapEventService, "getLoadingObservableForMap").and.callFake(
      (mapIndex: string) => {
        return mapIndex === "loading-map"
          ? loadingSubject
          : new ReplaySubject<boolean>();
      }
    );
    loadingSubject.next(true);
    component.mapIndex = "loading-map";
    expect(component["isLoading"]).toBeTruthy();
    component.mapIndex = "new-map-name";

    loadingSubject.next(false);
    // should not be updated, already unsubscribed
    expect(component["isLoading"]).toBeTruthy();
  });
});
