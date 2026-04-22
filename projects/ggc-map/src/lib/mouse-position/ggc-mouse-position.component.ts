import type { ElementRef } from "@angular/core";
import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import MousePosition, {
  Options as MousePositionOptions
} from "ol/control/MousePosition";
import { CoordinateFormat } from "ol/coordinate";
import OlMap from "ol/Map";
import { get, transform } from "ol/proj";
import { GgcCrsConfigService } from "../core/service/ggc-crs-config.service";
import { GgcMapDetailsContainerComponent } from "../map-details-container/ggc-map-details-container.component";
import { CoreMapService } from "../map/service/core-map.service";
import { CoordinateFormatPipe } from "../pipes/coordinate-format.pipe";
import { epsg28992 } from "../utils/epsg28992";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

@Component({
  selector: "ggc-mouse-position",
  templateUrl: "./ggc-mouse-position.component.html",
  styleUrls: ["./ggc-mouse-position.component.css"],
  standalone: true
})

/**
 * Component dat de actuele muispositie op een OpenLayers‑kaart weergeeft.
 *
 * Ondersteunt:
 * - verschillende coördinatenstelsels
 * - string- of callback‑gebaseerde formattering
 * - optionele weergave binnen een MapDetailsContainer
 */
export class GgcMousePositionComponent implements OnInit, OnDestroy {
  /**
   * Optionele injectie van de MapDetailsContainer.
   * Indien aanwezig wordt de mouse position daarin gerenderd.
   */
  mapDetailsContainer = inject(GgcMapDetailsContainerComponent, {
    optional: true
  });

  /** Aantal decimalen voor coördinaten */
  @Input() decimalDigits = 2;

  /** Index van de kaart waarop de mouse position wordt toegepast */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;

  /** Placeholder tekst wanneer geen coördinaat beschikbaar is */
  @Input() placeholder = " ";

  /** Doelprojectie waarin de coördinaten worden getoond */
  @Input() projection = epsg28992;

  private readonly coreMapService = inject(CoreMapService);
  private readonly crsConfigService = inject(GgcCrsConfigService);
  private _format: string | CoordinateFormat = "RD: x = {x} m; y = {y} m";
  private map: OlMap;
  private mode: "string" | "callback" = "string";
  private mousePositionControl: MousePosition;

  /**
   * Referentie naar het HTML-element
   * waarin de mouse position wordt gerenderd.
   */
  @ViewChild("ggcMousePosition", { static: true })
  private readonly ggcMousePosition: ElementRef;

  /** Geeft het huidige ingestelde coördinaatformaat terug */
  get format(): string | CoordinateFormat {
    return this._format;
  }

  @Input()
  set format(value: string | CoordinateFormat) {
    this.mode = typeof value === "string" ? "string" : "callback";
    this._format = value;
  }

  /** Initialiseert de MousePosition control en voegt deze toe aan de kaart */
  ngOnInit() {
    this.mousePositionControl = new MousePosition(
      this.createMousePositionOptions()
    );
    this.setCoordinateFormatOnMousePositionControl();
    this.setMousePositionControlOnMap();
  }

  /** Verwijdert de MousePosition control bij component destruction */
  ngOnDestroy() {
    if (this.map !== undefined) {
      this.map.removeControl(this.mousePositionControl);
    }
  }

  /**
   * Maakt de configuratie-opties aan voor de MousePosition control.
   */
  createMousePositionOptions(): MousePositionOptions {
    const options: MousePositionOptions = {
      projection: this.crsConfigService.getRdNewCrsConfig().projectionCode,
      placeholder: this.placeholder
    };
    // when parent component MapDetailsContainerComponent is present, target for mouseposition is set to nativeElement
    // to show the mouse position within the parent component instead of the default location on the map
    if (this.mapDetailsContainer) {
      options.target = this.ggcMousePosition.nativeElement;
    }
    return options;
  }

  /**
   * Koppelt de coördinaatformatter aan de MousePosition control.
   */
  private setCoordinateFormatOnMousePositionControl() {
    // 'bind' wordt hier gebruikt om de context van het component mee te geven
    // zodat de methode wordt uitgevoerd binnen de context van deze class in plaats van binnen OpenLayers.
    this.mousePositionControl.setCoordinateFormat(
      this.createCoordinateFormat.bind(this)
    );
  }

  /**
   * Converteert en formatteert een coördinaat
   * naar een string geschikt voor weergave.
   */
  private createCoordinateFormat(coord: number[] | undefined): string {
    if (!coord) {
      return "";
    }

    if (this.projection !== epsg28992) {
      if (!get(this.projection)) {
        throw new Error(`Unknown projection '${this.projection}'`);
      } else {
        coord = transform(coord, epsg28992, this.projection);
      }
    }

    if (this.mode === "string") {
      return new CoordinateFormatPipe().transform(
        coord,
        this.decimalDigits,
        this._format as string
      );
    } else {
      return (this._format as CoordinateFormat)(coord);
    }
  }

  /**
   * Voegt de MousePosition control toe aan de actuele kaart.
   */
  private setMousePositionControlOnMap() {
    this.map = this.coreMapService.getMap(this.mapIndex);
    this.map.addControl(this.mousePositionControl);
  }
}
