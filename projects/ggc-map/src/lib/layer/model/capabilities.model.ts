/**
 * Verwerkt WMS-capabilities en haalt de URL op voor `GetFeatureInfo`-requests.
 */
export class Capabilities {
  /**
   * De URL die gebruikt wordt om `GetFeatureInfo`-requests uit te voeren.
   */
  private featureInfoUrl: string;

  /**
   * Initialiseert een nieuwe instantie van Capabilities met de opgegeven capabilities.
   * @param cap Het capabilities-object zoals verkregen uit een WMS GetCapabilities-response.
   */
  constructor(cap: any) {
    this.setFeatureInfoUrl(cap);
  }

  /**
   * Geeft de URL terug die gebruikt wordt voor `GetFeatureInfo`.
   * @returns De `GetFeatureInfo`-URL als string.
   */
  getFeatureInfoUrl(): string {
    return this.featureInfoUrl;
  }

  /**
   * Stelt de `featureInfoUrl` in op basis van het capabilities-object.
   * @param cap Het capabilities-object.
   */
  private setFeatureInfoUrl(cap: any): void {
    this.featureInfoUrl =
      cap?.OperationsMetadata?.GetFeatureInfo?.DCP?.HTTP?.Get &&
      cap.OperationsMetadata.GetFeatureInfo.DCP.HTTP.Get.length > 0 &&
      cap.OperationsMetadata.GetFeatureInfo.DCP.HTTP.Get["0"]?.href;
  }
}
