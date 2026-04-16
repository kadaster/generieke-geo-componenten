import type { ElementRef } from "@angular/core";
import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { ScaleLine } from "ol/control";
import { Options as ScaleLineOptions, Units } from "ol/control/ScaleLine";
import OlMap from "ol/Map";
import { GgcMapDetailsContainerComponent } from "../map-details-container/ggc-map-details-container.component";
import { CoreMapService } from "../map/service/core-map.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

@Component({
  selector: "ggc-scale-line",
  templateUrl: "./ggc-scale-line.component.html",
  styleUrls: ["./ggc-scale-line.component.css"]
})
export class GgcScaleLineComponent implements OnInit, OnDestroy {
  mapDetailsContainer = inject(GgcMapDetailsContainerComponent, {
    optional: true
  });

  @Input() mapIndex: string = DEFAULT_MAPINDEX;
  @Input() units: Units = "metric";
  @ViewChild("ggcScaleLine", { static: true }) ggcScaleLine: ElementRef;
  private map: OlMap;
  private scaleControl: ScaleLine;
  private readonly coreMapService = inject(CoreMapService);

  ngOnInit(): void {
    this.scaleControl = new ScaleLine(this.createScaleLineOptions());

    this.map = this.coreMapService.getMap(this.mapIndex);
    this.map.addControl(this.scaleControl);
  }

  createScaleLineOptions(): ScaleLineOptions {
    const options: ScaleLineOptions = {
      units: this.units
    };
    // when parent component MapDetailsContainerComponent is present, target for scale line is set to nativeElement
    // to show the mouse position within the parent component instead of the default location on the map
    if (this.mapDetailsContainer) {
      options.target = this.ggcScaleLine.nativeElement;
    }
    return options;
  }

  ngOnDestroy(): void {
    if (this.map !== undefined) {
      this.map.removeControl(this.scaleControl);
    }
  }
}
