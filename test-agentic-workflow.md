I'll start by exploring the repo structure and the relevant models/services.

I've mapped the codebase. Two points in the story are ambiguous before I implement.

Now implementing the library changes. Starting with the `Style` model in `ggc-models`.

Now extending `AbstractConfigurableLayerOptions`.

Now the `GgcLayerService` style API.

Fixing that and inserting the new methods.

Now the private style helpers and the default-activeStyle initialisation in `loadWebservice`.

Now creating the GGC Home example.

Now registering the example in the index and routes.

Now running the full `ggc-map` suite and serving GGC Home to verify end to end.

Klaar. Technisch geïmplementeerd, met voorbeeld.

**ggc-models**
- Nieuw `Style` model (`name`, `title?`, `legend?: LayerLegend`), geëxporteerd via `public-api`.

**ggc-map**
- `AbstractConfigurableLayerOptions`: `styles?: Style[]` en `activeStyle?: string`.
- `GgcLayerService`:
    - `getStyles(layerId, mapIndex?): Style[]`
    - `getActiveStyle(layerId, mapIndex?): Style | undefined` (valt terug op de eerste stijl)
    - `setActiveStyle(styleName, layerId, mapIndex?)` — zet `activeStyle` + `activeLegend` (legend van de stijl indien opgegeven), vertaalt de stijl naar de laagopties (WMS `STYLES`-param, WMTS `sourceOptions.style`, vector tile mapbox style-url uit de `VectorTileStyle`-legenda) en herlaadt de zichtbare laag → `LayerChanged`- en legenda-events.
    - Bij het laden van een webservice wordt automatisch de eerste stijl actief als `activeStyle` leeg is.
- 8 nieuwe unit tests; volledige suite: 530 passed.

**ggc-home**
- Nieuw voorbeeld `/layer-styles` (radiobuttons per laag, kaart + legenda) met Kadastrale kaart (WMS, 3 stijlen) en BRT achtergrondkaart (vector tiles, 3 stijlen), geregistreerd in index en routes.

Verificatie: `build:ggc-models`, `build:ggc-map`, `ng build ggc-home`, `ng lint` (geen nieuwe warnings) en `ng serve` → route en kaartconfig geven 200.

Let op: de screenshot is nog de gegenereerde placeholder; die moet je nog vervangen.
