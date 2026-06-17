import { Component, inject, OnInit } from "@angular/core";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-opdr-1-kaartviewer-bouwen",
  imports: [GgcMapComponent],
  templateUrl: "./opdr-1-kaartviewer-bouwen.component.html",
  styleUrl: "./opdr-1-kaartviewer-bouwen.component.scss"
})
export class Opdr1KaartviewerBouwenComponent implements OnInit {
  protected webService: Webservice[] = [];

  private http: HttpClient = inject(HttpClient);

  ngOnInit() {
    this.http.get("webServiceConfig_opdr1.json").subscribe((data) => {
      console.log(data);
      this.webService = data as Webservice[];
    });
  }
}
