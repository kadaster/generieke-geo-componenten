import { TestBed } from "@angular/core/testing";

import { ProcessCapabilitiesService } from "./process-capabilities.service";
import { Capabilities } from "../../model/capabilities/capabilities";
import { Template } from "../../model/component/template";
import { Layout } from "../../model/capabilities/layout";

describe("ProcessCapabilitiesService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: ProcessCapabilitiesService = TestBed.inject(
      ProcessCapabilitiesService
    );
    expect(service).toBeTruthy();
  });

  it("getTemplatesFromCapabilities should return an array of templates", () => {
    const service: ProcessCapabilitiesService = TestBed.inject(
      ProcessCapabilitiesService
    );
    const capabilitiesMock: Capabilities = getCapabilitiesMock();

    const templates: Template[] =
      service.getTemplatesFromCapabilities(capabilitiesMock);

    expect(templates.length).toEqual(2);
    expect(templates[0].attributes).toEqual([
      {
        default: "Kadastrale Kaart",
        name: "Titel",
        type: "String"
      }
    ]);
  });

  it("getTemplatesFromCapabilities called with capabilities with no templates should return an empty array", () => {
    const service: ProcessCapabilitiesService = TestBed.inject(
      ProcessCapabilitiesService
    );
    const capabilitiesMock = {
      app: "DKK",
      smtp: {
        enabled: false
      },
      formats: ["jpeg", "jpg", "pdf"],
      layouts: [] as Layout[]
    };

    const templates: Template[] =
      service.getTemplatesFromCapabilities(capabilitiesMock);

    expect(templates.length).toEqual(0);
  });

  function getCapabilitiesMock() {
    return {
      app: "DKK",
      smtp: {
        enabled: false
      },
      formats: ["jpeg", "jpg", "pdf"],
      layouts: [
        {
          name: "A0 landscape",
          attributes: [
            {
              default: "Kadastrale Kaart",
              name: "Titel",
              type: "String"
            },
            {
              clientParams: {},
              name: "map",
              clientInfo: {
                dpiSuggestions: [180],
                maxDPI: 180,
                width: 3328,
                height: 2340
              },
              type: "MapAttributeValues"
            }
          ]
        },
        {
          name: "A4 portrait",
          attributes: [
            {
              default: "Kadaster",
              name: "referentie",
              type: "String"
            },
            {
              name: "map",
              clientInfo: {
                dpiSuggestions: [180],
                maxDPI: 180,
                width: 555,
                height: 660
              },
              type: "MapAttributeValues"
            }
          ]
        }
      ]
    };
  }
});
