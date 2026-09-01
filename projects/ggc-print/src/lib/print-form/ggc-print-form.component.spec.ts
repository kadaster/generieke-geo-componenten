import { provideHttpClientTesting } from "@angular/common/http/testing";
import { SimpleChange, SimpleChanges } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import { of, Subscription } from "rxjs";
import type { MockedObject } from "vitest";
import { AttributesControlService } from "../core/attributes/attributes-control.service";
import { ProcessCapabilitiesService } from "../core/capabilities/process-capabilities.service";
import { GgcMapfishInteractionService } from "../core/mapfish-interaction/ggc-mapfish-interaction.service";
import { PrintConfigService } from "../core/print-config/print-config.service";
import { PrintPreviewService } from "../core/print-preview/print-preview.service";
import { GgcMapfishPrintrequestCreateService } from "../core/print-request/ggc-mapfish-printrequest-create.service";
import { Attribute } from "../model/capabilities/attribute";
import { Capabilities } from "../model/capabilities/capabilities";
import { PrintConfig } from "../model/config/print-config.model";
import { PrintUtilTestMethods } from "../PrintUtilTestMethods";
import { GgcPrintFormComponent } from "./ggc-print-form.component";
import { Coordinate } from "ol/coordinate";
import { GgcPrintErrorTypes } from "../model/print-error.model";
import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";

describe("PrintFormComponent", () => {
  let component: GgcPrintFormComponent;
  let mapfishInteractionService: GgcMapfishInteractionService;
  let printConfigService: PrintConfigService;
  let processCapabilitiesSpy: MockedObject<ProcessCapabilitiesService>;
  let printExtentPreviewServiceSpy: MockedObject<PrintPreviewService>;
  let attributesControlSpy: MockedObject<AttributesControlService>;
  const configName = "ggc-print-config";
  const capabilitiesMock: Capabilities = {
    app: "Test Data",
    layouts: [
      {
        name: configName,
        attributes: [
          {
            name: "map",
            type: "MapAttributeValues",
            clientInfo: {
              dpiSuggestions: [180],
              maxDPI: 180,
              width: 3328,
              height: 2340
            }
          }
        ]
      }
    ],
    formats: ["PDF"]
  };

  beforeEach(async () => {
    printExtentPreviewServiceSpy = {
      prepareMapForPrintPreview: vi.fn(),
      updateMapAreaSize: vi.fn(),
      updateScale: vi.fn(),
      updateCenter: vi.fn(),
      clearPrintPreview: vi.fn(),
      getCenterFromPrintPreview: vi.fn()
    } as unknown as MockedObject<PrintPreviewService>;
    attributesControlSpy = {
      attributesToFormGroup: vi.fn()
    } as unknown as MockedObject<AttributesControlService>;
    attributesControlSpy.attributesToFormGroup.mockReturnValue(
      new FormGroup({})
    );
    processCapabilitiesSpy = {
      getTemplatesFromCapabilities: vi.fn()
    } as unknown as MockedObject<ProcessCapabilitiesService>;
    processCapabilitiesSpy.getTemplatesFromCapabilities.mockReturnValue([
      { name: configName, mapAreaSize: { width: 100, height: 200 } }
    ]);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        GgcMapfishInteractionService,
        PrintConfigService,
        {
          provide: PrintPreviewService,
          useValue: printExtentPreviewServiceSpy
        },
        {
          provide: GgcMapfishPrintrequestCreateService,
          useValue: {}
        },
        {
          provide: ProcessCapabilitiesService,
          useValue: processCapabilitiesSpy
        },
        { provide: AttributesControlService, useValue: attributesControlSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    mapfishInteractionService = TestBed.inject(GgcMapfishInteractionService);
    printConfigService = TestBed.inject(PrintConfigService);
    component = TestBed.runInInjectionContext(
      () => new GgcPrintFormComponent()
    );
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should create optionsForm", () => {
    expect(component["optionsForm"].controls["scale"].value).toEqual("");
    expect(component["optionsForm"].controls["template"].value).toEqual("");
  });

  it("ngOnInit should getCapabilities from MapfishInteractionService and call PrintPreviewService", () => {
    const serviceSpy = vi
      .spyOn(mapfishInteractionService, "getConfigCapabilities")
      .mockReturnValue(of(capabilitiesMock));
    const processCapabilitiesComponentSpy = vi.spyOn(
      component,
      "processCapabilities"
    );
    component.configurationName = configName;
    component.ngOnInit();

    expect(serviceSpy).toHaveBeenCalledWith(configName);
    expect(processCapabilitiesComponentSpy).toHaveBeenCalled();
    expect(
      printExtentPreviewServiceSpy.prepareMapForPrintPreview
    ).toHaveBeenCalled();
  });

  it("ngOninit should call setPrintserver() when it's given as an attribute", () => {
    const setPrintserverSpy = vi.spyOn(
      mapfishInteractionService,
      "setPrintserver"
    );

    component.printserver = "https://testUrl.nl/";
    component.ngOnInit();

    expect(setPrintserverSpy).toHaveBeenCalledWith("https://testUrl.nl/");
  });

  it("ngOninit should call prepareMapForPrintPreview() with a styleLike object when this is set", () => {
    const style = new Style({
      stroke: new Stroke({
        color: "rgba(235, 64, 52, 1)",
        width: 3
      })
    });
    const mapIndex = "test";

    component.previewStyle = style;
    component.mapIndex = mapIndex;
    component.ngOnInit();

    expect(
      printExtentPreviewServiceSpy.prepareMapForPrintPreview
    ).toHaveBeenCalledWith(mapIndex, style);
  });

  it("ngOninit should call provideApiKey() when it's given as an attribute", () => {
    const provideApiKeySpy = vi.spyOn(
      mapfishInteractionService,
      "provideApiKey"
    );

    const apiTestKey = "Dit is een Key";

    component.apiKey = apiTestKey;
    component.ngOnInit();

    expect(provideApiKeySpy).toHaveBeenCalledWith(apiTestKey);
  });

  it("ngOninit should call addKeysToPrintConfigs() when it's given as an attribute", () => {
    const addKeysToPrintConfigsSpy = vi.spyOn(
      printConfigService,
      "addKeysToPrintConfigs"
    );

    component.printConfigs = [new PrintConfig({ layerId: "testLayerId" })];

    component.ngOnInit();
    expect(addKeysToPrintConfigsSpy).toHaveBeenCalled();
  });

  it("processCapabilities should set template values", () => {
    processCapabilitiesSpy.getTemplatesFromCapabilities.mockReturnValue([
      { name: "ggc-template", mapAreaSize: { width: 100, height: 200 } }
    ]);
    component.processCapabilities(capabilitiesMock);

    expect(
      processCapabilitiesSpy.getTemplatesFromCapabilities
    ).toHaveBeenCalled();
    expect(component["templates"].length).toEqual(1);
    expect(component["templates"][0].name).toEqual("ggc-template");
    expect(component["error"]).toBeUndefined();
  });

  it("processCapabilities should set error when getTemplatesFromCapabilities returns zero templates", () => {
    expect(component["error"]).toBeUndefined();

    processCapabilitiesSpy.getTemplatesFromCapabilities.mockReturnValue([]);
    component.processCapabilities(capabilitiesMock);

    expect(component["templates"]).toEqual([]);
    expect(component["error"]).toBeDefined();
  });

  it("setDefaultValues should set template values", () => {
    // preparing
    component["templates"] = [
      { name: configName, mapAreaSize: { width: 11, height: 22 } },
      { name: "template2", mapAreaSize: { width: 33, height: 44 } }
    ];
    const patchValueSpy = vi.spyOn(component["optionsForm"], "patchValue");

    component.setDefaultValues();

    expect(patchValueSpy).toHaveBeenCalledWith({
      template: component["templates"][0],
      scale: 500
    });
  });

  it("when template, scale and attributes are changed, it should call changehandlers", () => {
    component["templates"] = [
      {
        name: "template1",
        mapAreaSize: { width: 11, height: 22 }
      },
      {
        name: "template2",
        mapAreaSize: { width: 33, height: 44 },
        attributes: [
          {
            default: "",
            name: "referentie",
            type: "String"
          }
        ]
      }
    ];
    component.setDefaultValues();

    component.addTemplateAndScaleChangeListeners();

    const addAttributesToFormGroupSpy = vi.spyOn(
      component as any,
      "addAttributesToFormGroup"
    );

    component["optionsForm"].controls["template"].setValue(
      component["templates"][1]
    );

    component["optionsForm"].controls["scale"].setValue(2000);

    expect(printExtentPreviewServiceSpy.updateMapAreaSize).toHaveBeenCalled();
    expect(printExtentPreviewServiceSpy.updateScale).toHaveBeenCalled();
    expect(addAttributesToFormGroupSpy).toHaveBeenCalled();
    expect(component["templateChangeSubscription"]).toBeDefined();
    expect(component["scaleChangeSubscription"]).toBeDefined();
    expect(component["optionsForm"].controls["scale"].value).toEqual(2000);
    expect(component["optionsForm"].controls["template"].value.name).toEqual(
      "template2"
    );
  });

  it(
    "when addAttributesToFormGroup() is called, it should call attributesToFormGroup(), delete the old ones from the optionsForm" +
      "and add the new ones afterward",
    () => {
      const attributesMock: Attribute[] =
        PrintUtilTestMethods.getAttributesMock();

      const attributesFormGroup = new FormGroup({});

      const formControl = new FormControl("");
      attributesFormGroup.addControl("referentie", formControl);
      attributesFormGroup.addControl("Subtitel", formControl);
      attributesFormGroup.addControl("Actualiteitsdatum", formControl);

      const formControlWithDefault = new FormControl("Kadastrale Kaart");
      attributesFormGroup.addControl("Titel", formControlWithDefault);

      const optionsFormRemoveControlSpy = vi.spyOn(
        component["optionsForm"],
        "removeControl"
      );
      const optionsFormAddControlSpy = vi.spyOn(
        component["optionsForm"],
        "addControl"
      );

      attributesControlSpy.attributesToFormGroup.mockReturnValue(
        attributesFormGroup
      );

      component["addAttributesToFormGroup"](attributesMock);

      expect(optionsFormRemoveControlSpy).toHaveBeenCalled();
      expect(optionsFormAddControlSpy).toHaveBeenCalled();
      expect(
        component["optionsForm"].controls["attributesGroup"].value
      ).toEqual(attributesFormGroup.value);
    }
  );

  describe("ngOnChanges", () => {
    it("ngOnChanges should not call updateCenter when SimpleChanges does not contain PrintPreviewCenter", () => {
      component.ngOnChanges({
        NietPrintPreviewCenter: {} as SimpleChange
      } as SimpleChanges);

      expect(printExtentPreviewServiceSpy.updateCenter).not.toHaveBeenCalled();
    });

    it("ngOnChanges should not call updateCenter when SimpleChange does not have a currentValue", () => {
      component.ngOnChanges({
        printPreviewCenter: { currentValue: undefined } as SimpleChange
      } as SimpleChanges);

      expect(printExtentPreviewServiceSpy.updateCenter).not.toHaveBeenCalled();
    });

    it("ngOnChanges should call updateCenter when a SimpleChange with currentValue is present", () => {
      component.ngOnChanges({
        printPreviewCenter: { currentValue: [123, 456] } as SimpleChange
      } as SimpleChanges);

      expect(printExtentPreviewServiceSpy.updateCenter).toHaveBeenCalledWith([
        123, 456
      ]);
    });

    it("ngOnChanges should not call attributesToFormGroup if this is the firstChange", () => {
      const addAttributesToFormGroupSpy = vi.spyOn(
        component as any,
        "addAttributesToFormGroup"
      );
      component.ngOnChanges({
        templateAttributes: {
          currentValue: {},
          firstChange: true
        } as SimpleChange
      } as SimpleChanges);
      expect(addAttributesToFormGroupSpy).not.toHaveBeenCalled();
    });

    it("ngOnChanges should call attributesToFormGroup if this is not the firstChange", () => {
      component["attributes"] = PrintUtilTestMethods.getAttributesMock();
      const addAttributesToFormGroupSpy = vi.spyOn(
        component,
        "addAttributesToFormGroup"
      );
      component.ngOnChanges({
        templateAttributes: {
          currentValue: {},
          firstChange: false
        } as SimpleChange
      } as SimpleChanges);
      expect(addAttributesToFormGroupSpy).toHaveBeenCalled();
    });
  });

  it("ngOnDestroy should unsubscribe to template changes and call clearPrintExtent", () => {
    component["templateChangeSubscription"] = {
      unsubscribe: () => undefined
    } as Subscription;
    component["scaleChangeSubscription"] = {
      unsubscribe: () => undefined
    } as Subscription;
    const templateSubscriptionSpy = vi.spyOn(
      component["templateChangeSubscription"],
      "unsubscribe"
    );
    const scaleSubscriptionSpy = vi.spyOn(
      component["scaleChangeSubscription"],
      "unsubscribe"
    );

    component.ngOnDestroy();

    expect(printExtentPreviewServiceSpy.clearPrintPreview).toHaveBeenCalled();
    expect(templateSubscriptionSpy).toHaveBeenCalled();
    expect(scaleSubscriptionSpy).toHaveBeenCalled();
  });

  it("should set center from print preview when onSubmit is called", () => {
    const centerCoordinatesMock: Coordinate = [5, 5];
    printExtentPreviewServiceSpy.getCenterFromPrintPreview.mockReturnValue(
      centerCoordinatesMock
    );

    component.onSubmit();

    expect(component["center"]).toEqual(centerCoordinatesMock);
  });

  it("should set error when onSubmit is called and center from print preview is not available", () => {
    printExtentPreviewServiceSpy.getCenterFromPrintPreview.mockReturnValue(
      undefined
    );

    component.onSubmit();

    expect(component["error"]).toBeTruthy();
    expect(component["error"]?.type).toBe(GgcPrintErrorTypes.MAPNOTAVAILABLE);
    expect(component["error"]?.technischeFout).toBe(
      "Middelpunt van het te printen gebied op de kaart kan niet worden bepaald"
    );
  });

  describe("isHiddenAttribute", () => {
    it("should return false when 'hiddenAttributes' is defined, but the value is not in the array", () => {
      component.hiddenAttributes = ["referentie", "subtitel"];
      const hidden = component["isAttributeHidden"]("pandStatus");
      expect(hidden).toBeFalsy();
    });

    it("should return false when 'hiddenAttributes' is undefined", () => {
      const hidden = component["isAttributeHidden"]("pandStatus");
      expect(hidden).toBeFalsy();
    });

    it("should return true when 'hiddenAttributes' is defined and the value is in the array", () => {
      component.hiddenAttributes = ["referentie", "subtitel"];
      const hidden = component["isAttributeHidden"]("referentie");
      expect(hidden).toBeTruthy();
    });
  });
});
