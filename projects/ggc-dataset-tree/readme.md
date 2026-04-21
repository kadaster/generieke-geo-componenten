# GGC Dataset-Tree

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

