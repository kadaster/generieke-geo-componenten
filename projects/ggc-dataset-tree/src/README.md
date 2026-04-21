# Generieke Geo Componenten - ggc-dataset-tree

De Generieke Geo Componenten (GGC) helpen softwareontwikkelaars om snel een kaartviewer te ontwikkelen.

Deze Angular front-end componenten kunnen in de eigen applicatie geïnstalleerd worden. Hiermee kan de kracht van OpenLayers kaartpresentatie snel en eenvoudig geïmplementeerd worden, gecombineerd met:
* zoeken op de kaart
* legenda
* kaartselectie
* toolbar met tekenen, meten en bewerken op de kaart

Binnenkort komen ook extra componenten beschikbaar voor:
* presenteren van object-informatie
* 3D kaartpresentatie (met Cesium)
* printen
* bestandsconversie

## Voordelen

De Generieke Geo Componenten bieden de volgende voordelen:
* Responsive design voor mobiel, tablet en desktop
* Digitaal toegankelijk (WCAG 2.1 AA)
* Up-to-date met de nieuwste framework versies
* Eenvoudig te implementeren, te configureren en te stylen
* Makkelijk aan te passen
* Robuust, met hoge testdekking
* Lage onderhoudsinspanning
* Light-weight, door alleen componenten te laden die nodig zijn

De componenten kunnen afzonderlijk óf in samenwerking gebruikt worden. Hierdoor kun je zelf bepalen welke interactie wenselijk is in de applicatie.

## Licentie

Dit project is gratis en open-source software, gelicentieerd onder de [European Union Public License (EUPL) v1.2](LICENSE.md).

## Documentatie

Bekijk onze [voorbeelden](TODO), de [quick start](TODO) of de [TSDocs](TODO).

© Documentatie: Dienst voor het kadaster en de openbare registers (Kadaster). Deze documentatie (met uitzondering van de TSDocs) is gelicentieerd onder CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

## Bugs

Gebruik de [GitHub issue tracker](https://github.com/kadaster/generieke-geo-componenten/issues) voor alle bugs en feature requests. Controleer eerst of een probleem al gemeld is voordat je een nieuw issue maakt.

## Contributing

Lees onze [contributing](https://github.com/kadaster/generieke-geo-componenten/tree/main?tab=contributing-ov-file) handleiding als je geinteresseerd bent om bij te dragen aan het project.

## GGC Dataset-Tree

Met de Dataset-tree componenten kunnen eenvoudig meerdere lagen worden geladen. Deze lagen zijn gegroepeerd in thema’s en datasets.
Via een JSON-configuratie kan een boomstructuur van webservices worden meegegeven. Deze structuur is eveneens ingedeeld in thema’s en datasets.
Binnen de Dataset-tree kunnen thema’s, datasets en individuele lagen eenvoudig worden in- en uitgeschakeld of met elkaar worden gewisseld.

Voor de dataset-tree is Bootstrap (versie 4.6.6) vereist.
In plaats van Bootstrap zou ook een eigen huisstijl gebruikt kunnen worden, die ook gebruik maakt van Bootstrap.

## Dataset-Tree
Alle onderdelen van het dataset-structuurcomponent (thema's, datasets en kaartlagen) zijn standaard voorzien van inspringing (padding-left)
zodat de verschillende niveau's in het dataset-structuurcomponent overzichtelijker worden.

Alle elementen binnen het dataset-structuurcomponent hebben een eigen CSS class selector.
Door middel van deze class selector kan een eigen styling worden toegepast op de elementen.
Het element dat een thema, dataset of kaartlaag bevat, heeft de class selector: ggc-dt-theme,
ggc-dt-dataset of ggc-dt-layer.
De class selectors van de overige elementen (bijvoorbeeld de buttons en iconen) kunnen gevonden worden in de templates van het component: theme-selector en layer-selector.
De iconen voor het open- en dichtklappen van een thema en dataset kunnen ingesteld worden.
Ook kunnen de iconen rechts of links uitgelijnd worden.

## Dataset-switcher
Om in de viewer de gebruiker de mogelijkheid te geven eenvoudig van kaartlagen (bijvoorbeeld een achtergrond) te wisselen,
is een zogeheten ggc-dataset-switcher aanwezig.

Dit interne component gebruikt grotendeels dezelfde datamodellen als de dataset-tree.
Met dit switch component wordt een lijst getoond van 1 of meerdere kaartlagen.
Deze kaartlagen worden getoond als een button met een naam en/of een plaatje.

### Dataset-switcher buttons
Een van de benodigde onderdelen om de dataset-switcher goed te laten werken zijn DatasetSwitcherButtons.
Deze buttons werken als een radio button en representeren uiteindelijk welke kaartlagen er getoond worden.
De 1e button zal standaard geactiveerd worden.
