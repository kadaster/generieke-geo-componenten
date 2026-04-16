import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import ImageLayer from "ol/layer/Image";
import { ImageStatic } from "ol/source";
import ImageSource from "ol/source/Image";
import { AbstractConfigurableLayerComponent } from "../abstract-configurable-layer/abstract-configurable-layer.component";
import { ImageLayerOptions } from "../model/image-layer.model";
import { Options } from "ol/source/ImageStatic";

/**
 * Door `<ggc-image-layer></ggc-image-layer>` op te nemen in de HTML kan een image
 * worden weergegeven als kaartlaag.
 *
 * @example
 * import { ImageLayerOptions } from "@kadaster/ggc-map";
 *
 * const imageLayerOptions: ImageLayerOptions = {
 *     url: "/assets/image1.png",
 *     zIndex: 4,
 *     attributions: "Attributie voor Image",
 *     mapIndex: "een",
 *     layerName: "Image kaartlaag"
 * };
 *
 * <ggc-image-layer [options]="imageLayerOptions"> </ggc-image-layer>
 */
@Component({
  selector: "ggc-image-layer",
  template: ""
})
export class GgcImageLayerComponent
  extends AbstractConfigurableLayerComponent<ImageLayer<ImageSource>>
  implements OnInit, OnDestroy
{
  /**
   * Opties voor het configureren van de afbeeldingslaag.
   * Bevat instellingen voor de bron en de laag zelf.
   */
  @Input() options?: ImageLayerOptions;

  private imageSource: ImageSource;

  /**
   * Initialiseert de afbeeldingslaag bij het laden van de component.
   * De afbeelding wordt geladen via ImageStatic en gekoppeld aan een ImageLayer.
   */
  ngOnInit() {
    super.ngOnInit();

    this.imageSource = new ImageStatic({
      // url is not optional in ImageStatic options, but can be set from options or input which can both be undefined.
      url: "",
      crossOrigin: "anonymous",
      ...this.options?.sourceOptions,
      // only set url when this.options.url is defined, otherwise it will overwrite url from this.options?.sourceOptions
      ...(this.options?.url && { url: this.options?.url }),
      ...(this.options?.imageExtent && {
        imageExtent: this.options?.imageExtent
      }),
      projection: this.rdNewConfig.projectionCode
    } as Options);

    this.setLayer(
      new ImageLayer({
        ...this.options?.layerOptions,
        ...this.layerOptions,
        source: this.imageSource
      })
    );
  }

  /**
   * Opruimen van resources bij het vernietigen van de component.
   */
  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
