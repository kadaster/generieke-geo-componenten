import Feature from "ol/Feature";
import Geometry from "ol/geom/Geometry";

/**
 * Container voor feature‑informatie die wordt gebruikt binnen
 * feature‑info weergaven (bijv. in `ggc-feature-info`).
 *
 */

export class FeatureInfoCollection {
  constructor(
    /**
     * @deprecated
     * De naam van de kaartla(a)g(en) waaraan de features gekoppeld zijn.
     * Deze wordt gevuld met layerTitle, layerName of layerId
     * Deze waarde wordt doorgaans gebruikt als titel of label
     * in de feature‑info UI.
     *
     */
    public layerName: string | undefined,
    /**
     * De verzameling features die horen bij de opgegeven kaartla(a)g(en).
     *
     */
    public features: Feature<Geometry>[] | object[],
    /**
     * De weergavetitel van de laag van deze featureInfoCollection.
     */
    public layerTitle: string | undefined,
    /**
     * De layerId waarbij de featureInfoCollection hoort
     */
    public layerId: string
  ) {}
}
