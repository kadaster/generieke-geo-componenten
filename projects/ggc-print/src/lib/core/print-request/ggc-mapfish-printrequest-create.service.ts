import { inject, Injectable } from "@angular/core";

import { basicGeojsonStyle, basicMeasureStyle } from "./mapfish-printstyles";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Circle, Geometry, LineString, Point, Polygon } from "ol/geom";
import BaseLayer from "ol/layer/Base";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import ImageSource from "ol/source/Image";
import ImageWMS from "ol/source/ImageWMS";
import TileSource from "ol/source/Tile";
import VectorSource from "ol/source/Vector";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { Attributes } from "../../model/print-request/attributes.model";
import { CustomParams } from "../../model/print-request/custom-params.model";
import { GeoJSONLayer } from "../../model/print-request/geojson-layer.model";
import { Layer } from "../../model/print-request/layer.model";
import { MapfishMap } from "../../model/print-request/mapfish-map.model";
import { MapFishPrintRequest } from "../../model/print-request/mapfish-printrequest.model";
import { Matrix } from "../../model/print-request/matrix.model";
import {
  ImageLayer as ImagePrintLayer,
  ImageLayerOptions
} from "../../model/print-request/image-layer.model";
import {
  WmsLayer,
  WmsLayerOptions
} from "../../model/print-request/wms-layer.model";
import {
  WmtsLayer,
  WmtsLayerOptions
} from "../../model/print-request/wmts-layer.model";
import { PrintConfigService } from "../print-config/print-config.service";
import { MapfishStyleV2 } from "../../model/print-request/mapfish-style-v2";
import { fromCircle } from "ol/geom/Polygon";
import TileWMS from "ol/source/TileWMS";
import {
  TiledWmsLayer,
  TiledWmsLayerOptions
} from "../../model/print-request/tiled-wms-layer.model";
import { ImageStatic } from "ol/source";
import VectorTileLayer from "ol/layer/VectorTile";
import { MapfishPrintProperties } from "../../model/print-request/mapfish-print-properties";
import { MVTEncoder } from "@geoblocks/print";
import { calculatePrintRectangle } from "../print-utils";
import {
  scaleToResolution,
  GgcCrsConfigService,
  GgcDrawService,
  GgcMapService
} from "@kadaster/ggc-map";

@Injectable({
  providedIn: "root"
})
export class GgcMapfishPrintrequestCreateService {
  private readonly mapService = inject(GgcMapService);
  private readonly drawService = inject(GgcDrawService);
  private readonly crsConfigService = inject(GgcCrsConfigService);
  private readonly printConfigService = inject(PrintConfigService);
  private customMeasureStyle: MapfishStyleV2 | undefined = undefined;
  private readonly dpi = 180;

  setCustomStyle(stylingObject: MapfishStyleV2 | undefined) {
    this.customMeasureStyle = stylingObject;
  }

  async createPrintRequest(
    printProperties: MapfishPrintProperties
  ): Promise<MapFishPrintRequest> {
    const layers: Layer[] = await this.createLayers(printProperties);
    printProperties.extraPrintlayers.forEach((layerName) => {
      const drawLayer = this.createDrawLayer(
        layerName,
        printProperties.mapIndex
      );
      if (drawLayer !== undefined) {
        layers.unshift(drawLayer);
      }
    });
    const outputFilename = this.createFileName(printProperties);
    const mapfishMap = this.createMapfishMap(
      printProperties.scale,
      layers,
      printProperties.center,
      printProperties.mapIndex
    );
    const attributes = this.createAttributes(
      mapfishMap,
      printProperties.attributes
    );
    return new MapFishPrintRequest(
      printProperties.layout,
      attributes,
      outputFilename
    );
  }

  createAttributes(mapfishMap: MapfishMap, values: object): Attributes {
    return { map: mapfishMap, ...values };
  }

  createMapfishMap(
    scale: number,
    layers: Layer[],
    coord: Coordinate,
    mapIndex?: string
  ): MapfishMap {
    const dpi = this.dpi;
    const projection = this.mapService
      .getMap(mapIndex)
      .getView()
      .getProjection()
      .getCode();
    // Coordinate is an array of numbers, get first 2 numbers as center for the MapFishMap
    const center: [number, number] = [coord[0], coord[1]];
    return new MapfishMap({ center, dpi, scale, layers, projection });
  }

  async createLayers(
    printProperties: MapfishPrintProperties
  ): Promise<Layer[]> {
    const layersArray: Layer[] = [];
    const layersFromMap = this.mapService
      .getMap(printProperties.mapIndex)
      .getLayers();
    let newLayer:
      | WmsLayer
      | TiledWmsLayer
      | WmtsLayer
      | GeoJSONLayer
      | ImagePrintLayer
      | undefined;
    // sort layers by zIndex. When zIndex is undefined, use default value of 0 for managed layers.
    // see: https://openlayers.org/en/latest/apidoc/module-ol_layer_Layer-Layer.html#setZIndex
    const sortedLayersFromMap = layersFromMap
      .getArray()
      .sort(
        (a: BaseLayer, b: BaseLayer) =>
          (a.getZIndex() ?? 0) - (b.getZIndex() ?? 0)
      );
    for (const eenLayer of sortedLayersFromMap) {
      if (
        !this.isScaleWithinMinMaxResolutionOfLayer(
          eenLayer,
          printProperties.scale
        )
      ) {
        continue;
      }
      newLayer = await this.createTypeOfLayer(eenLayer, printProperties);
      if (newLayer) {
        layersArray.unshift(newLayer);
      }
    }
    return layersArray;
  }

  private async createTypeOfLayer(
    eenLayer: BaseLayer,
    printProperties: MapfishPrintProperties
  ) {
    if (eenLayer instanceof ImageLayer) {
      if (eenLayer.getSource() instanceof ImageWMS) {
        return this.createWmsLayer(eenLayer);
      } else if (eenLayer.getSource() instanceof ImageStatic) {
        return this.createImageLayer(eenLayer);
      }
    } else if (eenLayer instanceof VectorLayer) {
      if (eenLayer.getSource() instanceof VectorSource) {
        if (eenLayer.getSource().getFormat() instanceof GeoJSON) {
          return this.createGeoJSONLayer(eenLayer);
        }
      }
    } else if (eenLayer instanceof TileLayer) {
      if (eenLayer.getSource() instanceof WMTS) {
        return this.createWmtsLayer(eenLayer);
      } else if (eenLayer.getSource() instanceof TileWMS) {
        return this.createTiledWmsLayer(eenLayer);
      }
    } else if (eenLayer instanceof VectorTileLayer) {
      return this.createVectorTileLayer(eenLayer, printProperties);
    }
  }

  createFileName(printProperties: MapfishPrintProperties): string | undefined {
    let outputfilename;
    if (printProperties.outputFilenameFunction !== undefined) {
      const propertyArray = Object.entries(printProperties.attributes);
      propertyArray.push(["layout", printProperties.layout]);
      propertyArray.push(["scale", printProperties.scale.toString()]);
      const fileNameMap = new Map<string, string>();
      propertyArray.forEach((value) => {
        fileNameMap.set(value[0], value[1]);
      });
      outputfilename = printProperties.outputFilenameFunction(fileNameMap);
      outputfilename = outputfilename === "" ? undefined : outputfilename;
    }
    return outputfilename;
  }

  private isScaleWithinMinMaxResolutionOfLayer(
    layer: BaseLayer,
    scale: number
  ): boolean {
    const printResolution = this.getResolutionForScale(scale);
    // when min- or maxResolution is not set, Openlayers returns default values: 0 for minResolution and Infinity for maxResolution
    const minResolution = layer.getMinResolution();
    const maxResolution = layer.getMaxResolution();
    return printResolution >= minResolution && printResolution < maxResolution;
  }

  private getResolutionForScale(scale: number): number {
    const INCHES_PER_METER = 39.37;
    const POINTS_PER_INCH = 90.71446714322;
    // resolutie (m/pixel) = schaalgetal / inches/m / pixels/inch
    // POINTS_PER_INCH is a calculated value, see scale-denominator.component.ts for more information
    return scale / INCHES_PER_METER / POINTS_PER_INCH;
  }

  private createWmsLayer(
    eenLayer: ImageLayer<ImageSource>
  ): WmsLayer | undefined {
    if (this.excludedFromPrint(eenLayer)) {
      return;
    }

    const layerSource = eenLayer.getSource() as ImageWMS;
    const styles = layerSource.getParams().STYLES;
    const layerOrLayers = layerSource.getParams().LAYERS;
    const technicalNames = this.parseToStringArray(layerOrLayers);
    const baseURL = layerSource.getUrl() ?? "";
    const customParams = new CustomParams({ TRANSPARENT: true });
    const options: WmsLayerOptions = {
      styles,
      layers: technicalNames,
      baseURL,
      customParams
    };

    const extractedPrintConfig = this.printConfigService.extractConfig(
      this.getLayerIdFromOLLayer(eenLayer)
    );
    if (extractedPrintConfig) {
      PrintConfigService.applyConfigToLayer(options, extractedPrintConfig);
    }
    return new WmsLayer(options);
  }

  private createTiledWmsLayer(
    eenLayer: TileLayer<TileWMS>
  ): TiledWmsLayer | undefined {
    if (this.excludedFromPrint(eenLayer)) {
      return;
    }

    const layerSource = eenLayer.getSource() as TileWMS;
    const styles = layerSource.getParams().STYLES;
    const layerOrLayers = layerSource.getParams().LAYERS;
    const technicalNames = this.parseToStringArray(layerOrLayers);
    const urls = layerSource.getUrls();
    const baseURL = urls ? urls[0] : "";
    const gutter = layerSource.getGutter();
    const customParams = new CustomParams({ TRANSPARENT: true });
    const options: TiledWmsLayerOptions = {
      layers: technicalNames,
      styles,
      baseURL,
      customParams,
      tileSize: [256, 256],
      tileBufferSize: [gutter, gutter]
    };

    const extractedPrintConfig = this.printConfigService.extractConfig(
      this.getLayerIdFromOLLayer(eenLayer)
    );
    if (extractedPrintConfig) {
      PrintConfigService.applyConfigToLayer(options, extractedPrintConfig);
    }
    return new TiledWmsLayer(options);
  }

  createImageLayer(
    eenLayer: ImageLayer<ImageStatic>
  ): ImagePrintLayer | undefined {
    if (this.excludedFromPrint(eenLayer)) {
      return;
    }

    const layerSource = eenLayer.getSource() as ImageStatic;
    const url = layerSource.getUrl();
    const options: ImageLayerOptions = {
      baseURL: url,
      extent: layerSource.getImageExtent()
    };
    return new ImagePrintLayer(options);
  }

  private createWmtsLayer(
    eenLayer: TileLayer<TileSource>
  ): WmtsLayer | undefined {
    if (this.excludedFromPrint(eenLayer)) {
      return;
    }

    const layerSource = eenLayer.getSource() as WMTS;
    const baseURL: string = (layerSource.getUrls() ?? [""])[0];
    const layer: string = layerSource.getLayer();
    const matrixSet: string = layerSource.getMatrixSet();
    const requestEncoding: string = layerSource.getRequestEncoding() as string;
    const tileGrid = layerSource.getTileGrid() as WMTSTileGrid;
    const matrices: Matrix[] = [];

    const tileSize = tileGrid.getTileSize(0) as number;
    const topLeftCorner: number[] = tileGrid.getOrigin(0);

    const rdNewCrsConfig = this.crsConfigService.getRdNewCrsConfig();
    const matrixSizes = rdNewCrsConfig.matrixSizes;
    const resolutions = rdNewCrsConfig.resolutions;
    let indexCounter = 0;

    tileGrid.getMatrixIds().forEach((matrixId: string) => {
      const matrixSize = matrixSizes[indexCounter];
      const resolution = resolutions[indexCounter];
      const matrixObject = new Matrix({
        identifier: matrixId,
        matrixSize: [matrixSize, matrixSize],
        topLeftCorner,
        scaleDenominator: resolution / 0.00028,
        tileSize: [tileSize, tileSize]
      });
      matrices.push(matrixObject);
      indexCounter++;
    });

    const options: WmtsLayerOptions = {
      layer,
      baseURL,
      matrixSet,
      requestEncoding,
      matrices
    };
    return new WmtsLayer(options);
  }

  private createGeoJSONLayer(
    eenLayer: VectorLayer<VectorSource<Feature<Geometry>>>
  ): GeoJSONLayer | undefined {
    if (this.excludedFromPrint(eenLayer)) {
      return;
    }

    const layerSource: VectorSource<Feature<Geometry>> =
      eenLayer.getSource() as VectorSource<Feature<Geometry>>;
    // layerSource.getUrl() is a string, see instelbare-geojson-kaartlaag from ggc-map
    const geoJSONUrl = layerSource.getUrl() as string;
    return new GeoJSONLayer({
      geoJson: geoJSONUrl,
      style: basicGeojsonStyle
    });
  }

  private createDrawLayer(
    layerName: string,
    mapIndex?: string
  ): GeoJSONLayer | undefined {
    if (this.drawService.isLayerVisible(layerName, mapIndex)) {
      const features: Feature<Geometry>[] = [];
      const layerFeatures = this.drawService.getFeaturesFromLayer(
        layerName,
        mapIndex
      );
      layerFeatures.forEach((feature: Feature<Geometry>) => {
        const type = feature.getGeometry()?.getType();
        feature.setProperties({ type, layername: layerName });
        if (type === "Circle") {
          const circle = this.createCircleFeature(feature);
          features.push(circle);
        } else {
          features.push(feature);
          if (feature.get("measurement") !== "none") {
            const label = this.createLabelFeature(feature);
            features.push(label);
          }
        }
      });
      return this.createJsonObject(features);
    }
  }

  async createVectorTileLayer(
    eenLayer: VectorTileLayer,
    printProperties: MapfishPrintProperties
  ): Promise<ImagePrintLayer | undefined> {
    if (this.excludedFromPrint(eenLayer)) {
      return;
    }

    const encoder = new MVTEncoder();
    const extentSize = calculatePrintRectangle(
      printProperties.mapAreaSize,
      printProperties.scale,
      printProperties.center
    );

    // work around bug in geoblocks door tilegrid met 1 uit te breiden
    const tileGrid = eenLayer.getSource()!.getTileGrid()!;
    const tileGridResolutions = tileGrid.getResolutions();
    const scale = printProperties.scale;
    const mapAreaSize = printProperties.mapAreaSize;
    tileGridResolutions.push(0);

    const options = {
      layer: eenLayer,
      printExtent: extentSize,
      tileResolution: scaleToResolution(scale),
      styleResolution: scaleToResolution(scale),
      canvasSize: this.canvasSizeFromDimensionsInPdfPoints(
        [mapAreaSize.width, mapAreaSize.height],
        this.dpi
      )
    };

    const result = await encoder.encodeMVTLayer(options);
    // herstel tilegrid work around
    tileGridResolutions.pop();

    const imageLayerOptions: ImageLayerOptions = {
      baseURL: result[0].baseURL,
      extent: result[0].extent
    };
    return new ImagePrintLayer(imageLayerOptions);
  }

  private createJsonObject(features: Feature<Geometry>[]): GeoJSONLayer {
    const writer = new GeoJSON();
    const geoJsonCollection = writer.writeFeaturesObject(features);
    const stylingObject = this.customMeasureStyle ?? basicMeasureStyle;
    return new GeoJSONLayer({
      geoJson: geoJsonCollection,
      style: stylingObject
    });
  }

  private createLabelFeature(feature: Feature<Geometry>): Feature<Geometry> {
    const label = feature.clone();
    const geometry: Point =
      feature.getGeometry()?.getType() === "Polygon"
        ? new Point(
            (feature.getGeometry() as Polygon)
              .getInteriorPoint()
              .getCoordinates()
          )
        : new Point((feature.getGeometry() as LineString).getLastCoordinate());
    label.setProperties({ geometry, type: "Point" });
    return label;
  }

  private createCircleFeature(feature: Feature<Geometry>): Feature<Geometry> {
    const circle = feature.clone();
    circle.setGeometry(fromCircle(feature.getGeometry() as Circle, 128));
    const type = circle.getGeometry()?.getType();
    circle.setProperties({ type });
    return circle;
  }

  private parseToStringArray(value: string | string[]): string[] {
    const array: string[] = [];
    if (typeof value === "string") {
      array.push(value);
      return array;
    } else {
      return value;
    }
  }

  canvasSizeFromDimensionsInPdfPoints(
    dimensions: [number, number],
    dpi: number
  ): [number, number] {
    // pdf-points -> inch: / 72 // this is a convention
    // inch -> dots: nbInches * dpi
    return dimensions.map((pdfPoints) => (pdfPoints * dpi) / 72) as [
      number,
      number
    ];
  }

  private excludedFromPrint(eenLayer: BaseLayer) {
    return this.printConfigService.isLayerPrintDisabled(
      this.getLayerIdFromOLLayer(eenLayer)
    );
  }

  private getLayerIdFromOLLayer(layer: BaseLayer): string {
    return layer.get("ggc-layer-id");
  }
}
