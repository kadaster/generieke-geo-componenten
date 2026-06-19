import { Routes } from "@angular/router";
import { Opdr1KaartviewerBouwenComponent } from "./opdr-1-kaartviewer-bouwen/opdr-1-kaartviewer-bouwen.component";
import { Opdr2ComponentenConfiguratieComponent } from "./opdr-2-componenten-configuratie/opdr-2-componenten-configuratie.component";
import { Opdr3KaartConfiguratieComponent } from "./opdr-3-kaart-configuratie/opdr-3-kaart-configuratie.component";
import { GgcIntroFoss4gComponent } from "./ggc-intro-foss4g/ggc-intro-foss4g.component";

export const routes: Routes = [
  { path: "", redirectTo: "intro", pathMatch: "full" },
  { path: "intro", component: GgcIntroFoss4gComponent },
  { path: "opdracht1", component: Opdr1KaartviewerBouwenComponent },
  { path: "opdracht2", component: Opdr2ComponentenConfiguratieComponent },
  { path: "opdracht3", component: Opdr3KaartConfiguratieComponent }
];
