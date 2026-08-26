import { TestBed } from "@angular/core/testing";
import { AttributesControlService } from "./attributes-control.service";
import { FormGroup } from "@angular/forms";
import { Attribute } from "../../model/capabilities/attribute";
import { PrintUtilTestMethods } from "../../PrintUtilTestMethods";

describe("AttributesControlService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: AttributesControlService = TestBed.inject(
      AttributesControlService
    );
    expect(service).toBeTruthy();
  });

  it("attributesToFormGroup should transform an array of the type Attribute into an FormGroup", () => {
    const service: AttributesControlService = TestBed.inject(
      AttributesControlService
    );
    const attributesMock: Attribute[] =
      PrintUtilTestMethods.getAttributesMock();
    const templateAttributes: Map<string, string> = new Map<string, string>();

    const formGroup: FormGroup = service.attributesToFormGroup(
      attributesMock,
      templateAttributes
    );

    expect(formGroup.contains("referentie")).toBe(true);
    expect(formGroup.contains("Titel")).toBe(true);
    expect(formGroup.contains("Subtitel")).toBe(true);
    expect(formGroup.contains("Actualiteitsdatum")).toBe(true);
    expect(formGroup.getRawValue()["Titel"]).toBe("Kadastrale Kaart");
  });

  it("attributesToFormGroup should transform an array of the type Attribute and a Map of templateAttributes into an FormGroup", () => {
    const service: AttributesControlService = TestBed.inject(
      AttributesControlService
    );
    const attributesMock: Attribute[] =
      PrintUtilTestMethods.getAttributesMock();
    const templateAttributes: Map<string, string> = new Map<string, string>();
    templateAttributes.set("Titel", "New Title");
    templateAttributes.set("Subtitel", "New Subtitle");

    const formGroup: FormGroup = service.attributesToFormGroup(
      attributesMock,
      templateAttributes
    );

    expect(formGroup.contains("referentie")).toBe(true);
    expect(formGroup.contains("Titel")).toBe(true);
    expect(formGroup.contains("Subtitel")).toBe(true);
    expect(formGroup.contains("Actualiteitsdatum")).toBe(true);
    expect(formGroup.getRawValue()["Titel"]).toBe("New Title");
    expect(formGroup.getRawValue()["Subtitel"]).toBe("New Subtitle");
  });
});
