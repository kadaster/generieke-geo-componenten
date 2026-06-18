import { Routes } from "@angular/router";
import { Opdr1KaartviewerBouwenComponent } from "./opdr-1-kaartviewer-bouwen/opdr-1-kaartviewer-bouwen.component";
import { Opdr2ComponentenConfiguratieComponent } from "./opdr-2-componenten-configuratie/opdr-2-componenten-configuratie.component";
import { Opdr3KaartConfiguratieComponent } from "./opdr-3-kaart-configuratie/opdr-3-kaart-configuratie.component";

export const routes: Routes = [
  { path: "", component: Opdr1KaartviewerBouwenComponent },
  { path: "opdracht1", component: Opdr1KaartviewerBouwenComponent },
  { path: "opdracht2", component: Opdr2ComponentenConfiguratieComponent },
  { path: "opdracht3", component: Opdr3KaartConfiguratieComponent }
];
