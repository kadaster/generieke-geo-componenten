# Generieke Geo Componenten - ggc-map

De Generieke Geo Componenten (GGC) helpen softwareontwikkelaars om snel een kaartviewer te ontwikkelen.

Deze front-end componenten, gemaakt met Angular/TypeScript, kunnen in de eigen Angular-applicatie geïnstalleerd worden. Hiermee kan de kracht van OpenLayers kaartpresentatie snel en eenvoudig geïmplementeerd worden, gecombineerd met:

- zoeken op de kaart
- legenda
- kaartweergave kiezen
- toolbar met tekenen, meten en bewerken op de kaart
- presenteren van object-informatie
- 3D kaartpresentatie (met Cesium)
- printen van kaarten (met MapFish Print)
- bestandsconversie

## Voordelen

De Generieke Geo Componenten bieden de volgende voordelen:

- Responsive design voor mobiel, tablet en desktop
- Digitaal toegankelijk (WCAG 2.1 AA)
- Up-to-date met de nieuwste framework versies
- Eenvoudig te implementeren, te configureren en te stylen
- Makkelijk aan te passen
- Robuust, met hoge testdekking
- Lage onderhoudsinspanning
- Light-weight, door alleen componenten te laden die nodig zijn

De componenten kunnen afzonderlijk óf in samenwerking gebruikt worden. Hierdoor kun je zelf bepalen welke interactie wenselijk is in de applicatie.

## Internationalisatie

De Generieke Geo Componenten ondersteunen de Nederlandse standaarden:
* Nederlandse taal
* Rijksdriehoekscoördinaten:
  * ggc-map ondersteunt coördinatenreferentiesysteem "RD New" (EPSG:28992)
  * ggc-map-3d ondersteunt coördinatenreferentiesysteem "RD New" (EPSG:28992) en "WGS 84" (EPSG:4326)

## Lijst van componenten

- [@kadaster/ggc-conversion](https://www.npmjs.com/package/@kadaster/ggc-conversion)
- [@kadaster/ggc-dataset-tree](https://www.npmjs.com/package/@kadaster/ggc-dataset-tree)
- [@kadaster/ggc-feature-info](https://www.npmjs.com/package/@kadaster/ggc-feature-info)
- [@kadaster/ggc-legend](https://www.npmjs.com/package/@kadaster/ggc-legend)
- [@kadaster/ggc-map](https://www.npmjs.com/package/@kadaster/ggc-map)
- [@kadaster/ggc-map-3d](https://www.npmjs.com/package/@kadaster/ggc-map-3d)
- [@kadaster/ggc-models](https://www.npmjs.com/package/@kadaster/ggc-models)
- [@kadaster/ggc-print](https://www.npmjs.com/package/@kadaster/ggc-print)
- [@kadaster/ggc-search-location](https://www.npmjs.com/package/@kadaster/ggc-search-location)
- [@kadaster/ggc-toolbar](https://www.npmjs.com/package/@kadaster/ggc-toolbar)

## Licentie

Dit project is gratis en open-source software, gelicentieerd onder de [European Union Public License (EUPL) v1.2](LICENSE.md).

## Documentatie

Bekijk onze [voorbeelden](https://generiekegeocomponenten.nl/example-index), de [quick start](https://generiekegeocomponenten.nl/quick-start) of de [TSDocs](https://www.generiekegeocomponenten.nl/tsdocs/).

© Documentatie: Dienst voor het kadaster en de openbare registers (Kadaster). Deze documentatie (met uitzondering van de TSDocs) is gelicentieerd onder CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

## Bugs

Gebruik de [GitHub issue tracker](https://github.com/kadaster/generieke-geo-componenten/issues) voor alle bugs en feature requests. Controleer eerst of een probleem al gemeld is voordat je een nieuw issue maakt.

## Contributing

Lees onze [contributing](https://github.com/kadaster/generieke-geo-componenten/tree/main?tab=contributing-ov-file) handleiding als je geinteresseerd bent om bij te dragen aan het project.

## 2D en/of 3D kaartweergave

Wat te doen bij de runtime foutmelding:
> Failed to resolve import "@kadaster/ggc-map-3d" from ".angular/vite-root/...". Does the file exist?
> 
De componenten ondersteunen 2D en 3D kaarten en alleen de dependencies zijn nodig voor de gewenste kaartweergave. `@kadaster/ggc-map` en `@kadaster/ggc-map-3d` zijn dan gemarkeerd als optionele dependencies. **Let op!** Om dit goed te laten werken is een aanpassing in de `angular.json` nodig: de dependency die je **niet** nodig hebt moet aan de externalDependencies worden toegevoegd. Bijvoorbeeld in het geval dat je een 2D kaartweergave gebruikt en geen 3D nodig hebt:

In de angular.json:
```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "externalDependencies": [
              "@kadaster/ggc-map-3d"
            ]
          }
        }
      }
    }
  }
}
```
