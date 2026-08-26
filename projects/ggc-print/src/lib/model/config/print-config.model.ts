export interface PrintConfigOptions {
  layerId: string;
  // De print url wordt bv door DKK gebruikt om de kaartlagen uit een andere, open service te halen
  // De kaartlagen van de DKK komen uit een beschermde omgeving waar de print service niet mee kan handelen
  printUrl?: string;
  printStyles?: string[];
  disablePrint?: boolean;
}

export class PrintConfig {
  layerId: string;
  printUrl?: string;
  printStyles?: string[];
  disablePrint = false;

  constructor(printConfigOptions: PrintConfigOptions) {
    this.layerId = printConfigOptions.layerId;
    this.printUrl = printConfigOptions.printUrl;
    this.printStyles = printConfigOptions.printStyles;
    if (printConfigOptions.disablePrint) {
      this.disablePrint = printConfigOptions.disablePrint;
    }
  }
}
