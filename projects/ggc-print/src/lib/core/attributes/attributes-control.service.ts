import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Attribute } from "../../model/capabilities/attribute";

@Injectable({
  providedIn: "root"
})
export class AttributesControlService {
  attributesToFormGroup(
    attributes: Attribute[],
    templateAttributes: Map<string, string>
  ): FormGroup {
    const formGroup: FormGroup = new FormGroup({});
    const formBuilder: FormBuilder = new FormBuilder();
    attributes.forEach((attribute) => {
      let formControl;
      if (templateAttributes && templateAttributes.get(attribute.name)) {
        formControl = formBuilder.control(
          templateAttributes.get(attribute.name)
        );
      } else {
        formControl = formBuilder.control(attribute.default);
      }
      formGroup.addControl(attribute.name, formControl);
    });
    return formGroup;
  }
}
