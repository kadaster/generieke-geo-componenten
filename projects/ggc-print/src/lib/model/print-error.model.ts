export enum GgcPrintErrorTypes {
  HTTPERROR = "httpError",
  MAPNOTAVAILABLE = "mapNotAvailable",
  NOVALIDRESPONSE = "noValidResponse",
  PRINTSTATUSCANCELLED = "printstatuscancelled",
  MAPFISHERROR = "mapfishError",
  CAPABILITIESPROCESSING = "capabilitiesProcessingError"
}

export class GgcPrintError {
  type: GgcPrintErrorTypes;
  foutmelding: string;
  technischeFout: string;

  constructor(type: GgcPrintErrorTypes, technischeFout: string) {
    this.type = type;
    this.foutmelding = this.getFoutmeldingForGgcPrintErrorType(this.type);
    this.technischeFout = technischeFout;
  }

  private getFoutmeldingForGgcPrintErrorType(type: GgcPrintErrorTypes): string {
    // Errormessages for specific GgcPrintErrorTypes can be set here
    switch (type) {
      case GgcPrintErrorTypes.HTTPERROR:
        return "Het ophalen van gegevens is mislukt, probeer het later nog een keer";
      case GgcPrintErrorTypes.NOVALIDRESPONSE:
      case GgcPrintErrorTypes.CAPABILITIESPROCESSING:
        return "Er ging iets mis bij het verwerken van gegevens, probeer het later nog eens";
      case GgcPrintErrorTypes.PRINTSTATUSCANCELLED:
        return "Printopdracht duurde te lang en is geannuleerd, probeer het later nog een keer";
      case GgcPrintErrorTypes.MAPFISHERROR:
        return "Er is iets misgegaan bij het uitvoeren van de printopdracht door de printserver, probeer het later nog een keer";
      default:
        return "Er is iets fout gegaan, probeer het later nog een keer";
    }
  }
}
