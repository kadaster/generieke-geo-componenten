import { Layout } from "./layout";

export class Capabilities {
  app: string;
  layouts: Layout[];
  formats: string[];

  static isCapabilities(value: Capabilities): value is Capabilities {
    return (
      value &&
      Array.isArray(value.layouts) &&
      typeof value.layouts === "object" &&
      Array.isArray(value.formats) &&
      typeof value.formats === "object"
    );
  }
}
