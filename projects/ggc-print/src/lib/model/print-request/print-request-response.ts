export class PrintRequestResponse {
  ref: string;
  statusURL: string;
  downloadURL: string;

  /* Deze methode zorgt ervoor dat er wordt gecheckt of een object van het type PrintRequestResponse.
   * Dit is voornamelijk handig voor de MapfishInteractionService. Compile-time gaan we er namelijk van uit dat we
   * altijd een PrintRequestResponse terugkrijgen, maar runtime kan dit anders lopen.*/
  static isPrintRequestResponse(
    value: PrintRequestResponse
  ): value is PrintRequestResponse {
    return (
      value &&
      typeof value.downloadURL === "string" &&
      typeof value.statusURL === "string" &&
      typeof value.ref === "string"
    );
  }
}
