import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root"
})
export class PiwikScriptLoaderService {
  constructor() {}

  loadPiwikScript(): void {
    const piwikScriptElement = document.getElementById(
      "piwik-script"
    ) as HTMLScriptElement;
    console.log("piwikScriptElement: ", piwikScriptElement);

    // Set the correct piwik-script path from the environment file
    if (piwikScriptElement) {
      piwikScriptElement.src =
        "./assets/piwik-script/" + environment.piwikScript;
      piwikScriptElement.async = true;
      console.log("piwikScript: ", piwikScriptElement.src);
    }
  }
}
