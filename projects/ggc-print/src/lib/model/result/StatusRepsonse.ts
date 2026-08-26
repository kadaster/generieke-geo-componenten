export enum StatusResponseStatus {
  FINISHED = "finished",
  CANCELLED = "cancelled",
  ERROR = "error"
}
export class StatusResponse {
  // interface representing the mapfish Status Response
  // for documentation see: https://mapfish.github.io/mapfish-print-doc/api.html#status

  done: boolean;
  status: string;
  elapsedTime: number;
  waitingTime: number;
  error: string;
  downloadURL: string;

  /*
Deze methode zorgt ervoor dat er wordt gecheckt of een object van het type StatusResponse.
Dit is voornamelijk handig voor de MapfishInteractionService. Compile-time gaan we er namelijk van uit dat we
altijd een StatusResponse terugkrijgen, maar runtime kan dit anders lopen.
*/
  static isStatusResponse(value: StatusResponse): value is StatusResponse {
    return (
      value &&
      typeof value.done === "boolean" &&
      typeof value.status === "string" &&
      typeof value.elapsedTime === "number" &&
      typeof value.waitingTime === "number" &&
      (value.error === undefined || typeof value.error === "string") &&
      typeof value.downloadURL === "string"
    );
  }
}
