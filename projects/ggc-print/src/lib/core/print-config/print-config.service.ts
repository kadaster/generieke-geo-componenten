import { Injectable } from "@angular/core";
import { PrintConfig } from "../../model/config/print-config.model";
import { WmsLayerOptions } from "../../model/print-request/wms-layer.model";
import { TiledWmsLayerOptions } from "../../model/print-request/tiled-wms-layer.model";

@Injectable({
  providedIn: "root"
})
export class PrintConfigService {
  private printConfigsMap: Map<string, PrintConfig>;

  extractConfig(layerId: string): PrintConfig | undefined {
    return this.printConfigsMap?.get(layerId);
  }

  isLayerPrintDisabled(layerId: string): boolean {
    const extractedConfig = this.extractConfig(layerId);
    return extractedConfig ? extractedConfig.disablePrint : false;
  }

  addKeysToPrintConfigs(printConfigs: Array<PrintConfig>) {
    const printConfigsMap: Map<string, PrintConfig> = new Map<
      string,
      PrintConfig
    >();
    for (const config of printConfigs) {
      printConfigsMap.set(config.layerId, config);
    }
    this.setPrintConfigsMap(printConfigsMap);
  }

  private setPrintConfigsMap(printsConfigsMap: Map<string, PrintConfig>) {
    this.printConfigsMap = printsConfigsMap;
  }

  static applyConfigToLayer(
    options: WmsLayerOptions | TiledWmsLayerOptions,
    printConfig: PrintConfig
  ) {
    options.baseURL = this.replaceOrKeepUrl(
      options.baseURL,
      printConfig.printUrl
    );
    if (printConfig.printStyles) {
      options.styles = printConfig.printStyles;
    }
  }

  private static replaceOrKeepUrl(
    baseUrl: string,
    printUrl: string | undefined
  ) {
    return printUrl ? printUrl : baseUrl;
  }
}
