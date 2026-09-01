import { Attribute } from "./model/capabilities/attribute";

export class PrintUtilTestMethods {
  static getAttributesMock() {
    return [
      {
        default: "",
        name: "referentie",
        type: "String"
      },
      {
        default: "Kadastrale Kaart",
        name: "Titel",
        type: "String"
      },
      {
        default: "",
        name: "Subtitel",
        type: "String"
      },
      {
        default: "",
        name: "Actualiteitsdatum",
        type: "String"
      }
    ] as Attribute[];
  }
}
