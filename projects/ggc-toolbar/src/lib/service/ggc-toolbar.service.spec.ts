import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { Injector } from "@angular/core";
import { GgcToolbarConnectService } from "./connect.service";
import { GgcToolbarService } from "./ggc-toolbar.service";

describe("GgcToolbarService", () => {
  let service: GgcToolbarService;
  let injectorSpy: MockedObject<Injector>;

  beforeEach(() => {
    injectorSpy = {
      get: vi.fn().mockName("Injector.get")
    };

    TestBed.configureTestingModule({
      providers: [
        GgcToolbarConnectService,
        { provide: Injector, useValue: injectorSpy }
      ]
    });

    service = TestBed.inject(GgcToolbarService);
  });

  it("Moet correct geïnitialiseerd worden", () => {
    expect(service).toBeTruthy();
  });
});
