# Stijlgids & AI-instructie — teksten voor ggc-home voorbeelden

## 0. Doel & rol van de AI
Je schrijft de **inhoudelijke tekst** van een GGC-voorbeeldpagina. De technische scaffold (bestanden, imports, layout) maakt `plop` al. Jij vult uitsluitend de tekstvelden consistent met de bestaande voorbeelden.

Je levert altijd deze onderdelen:
1. `title` (in `componentInfo`, `.component.ts`)
2. `introduction` (in `componentInfo`, `.component.ts`)
3. De `<p>`/`<ul>`-inhoud van `<div page-introduction>` (in `.component.html`)
4. Optioneel: `<div page-tips>`-inhoud

Taal: **Nederlands**. Toon: professioneel, beknopt, informeel (`je`, niet `u`). Nooit marketing-taal. Zo veel mogelijk B1 niveau taalgebruik (behalve bij terminologie).

---

## 1. `title` — titel van het voorbeeld

Regels:
- **Sentence case**: alleen eerste woord (en eigennamen/afkortingen) met hoofdletter.
- **Kort**, meestal 2–7 woorden.
- **Geen afsluitende punt**.
- Beschrijft de handeling/het onderwerp, niet het component zelf.
- Afkortingen/formaten in hoofdletters: `WMS`, `WMTS`, `WFS`, `OGC API`, `GeoJSON`, `GML`, `JSON`, `3D`.

**Vaste patronen (kies de best passende):**

| Situatie | Patroon | Voorbeeld |
|---|---|---|
| Kaartlaag toevoegen | `Kaartlaag toevoegen: <TYPE> (<detail>)` | `Kaartlaag toevoegen: WMS (raster)` |
| Objectinformatie | `Objectinformatie weergeven[ <variant>]` | `Objectinformatie weergeven in tabbladen` |
| Tekenen | `Tekenen met <manier>` | `Tekenen met de muis` |
| Selecteren | `Objecten selecteren op de kaart (<bron>)` | `Objecten selecteren op de kaart (WFS/OGC API)` |
| Dataset | `Dataset wisselen (<variant>)` | `Dataset wisselen (radio buttons)` |
| Kaartlagen aan/uit | `Kaartlagen aan-/uitzetten (<variant>)` | `Kaartlagen aan-/uitzetten (lijst)` |
| Losse feature | kort werkwoord/onderwerp | `Meten`, `Locatie zoeken`, `Snapping (verbinden)` |

**Varianten-suffix (verplicht consistent):**
- Uitgebreide variant → achtervoegsel `(uitgebreid)`. Bijv. `Locatie zoeken (uitgebreid)`.
- 3D-variant → achtervoegsel `(3D)`. Bijv. `Objectinformatie weergeven (3D)`.

---

## 2. `introduction` — één-zins samenvatting

Regels:
- **Precies één zin, eindigend op een punt.**
- **Begin met een werkwoord** (imperatief/infinitief), zo veel mogelijk actief: `Zoek…`, `Teken…`, `Toon…`, `Voeg … toe`, `Kies…`, `Zet … aan of uit`, `Converteer…`, `Gebruiken van…`, `Toepassen van…`.
- ~6–14 woorden. Beschrijft *wat* de gebruiker met het voorbeeld doet/ziet, niet *hoe*.
- Geen `<code>`, geen HTML — dit is een platte string in TypeScript.
- Deze string wordt automatisch als eerste `<p>` in de `page-introduction` getoond; herhaal hem dus **niet** letterlijk in de body.

**Sjablonen per feature-type (afgeleid uit bestaande voorbeelden):**
- Kaartlaag: `Voeg een <TYPE> laag toe aan de kaart[ met <API>].`
- Objectinfo: `Toon informatie over geografische objecten op de kaart[ <variant>].`
- Tekenen: `Teken lijnen, punten, vlakken, rechthoeken en cirkels met <manier>.`
- Meten: `Lengtes en oppervlaktes laten zien bij het tekenen van een figuur.`
- Zoeken: `Zoek een adres, woonplaats[, perceel] of huidige locatie met de PDOK Locatie API.`
- Selecteren: `Kies en markeer objecten door in de kaart te klikken.`
- Dataset wisselen: `Eén of meer kaartlagen verwisselen met <bediening>.`
- Legenda: `Toon de legenda van één of meer kaartlagen.`
- Eigen stijl: `Gebruiken van een eigen stijl voor <handeling>.`

---

## 3. `<div page-introduction>` — de body

Vaste opbouw (in deze volgorde; sla over wat niet van toepassing is):

```html
<div page-introduction>
  <p>{{ componentInfo.introduction }}</p>

  <!-- 1–3 context-paragrafen -->
  <p>
    In dit voorbeeld <uitleg wat er te zien/doen is en hoe het werkt>.
  </p>

  <!-- optioneel: instelmogelijkheden -->
  <p>Instelmogelijkheden voor <onderwerp> (<code>configObject</code>):</p>
  <ul>
    <li><omschrijving> (<code>parameter</code>)</li>
    <li><omschrijving> (<code>parameter</code>)</li>
  </ul>

  <!-- optioneel: waarschuwing -->
  <p><b>Let op:</b> <belangrijke randvoorwaarde>.</p>

  <!-- optioneel: externe verwijzing -->
  <p>
    Zie <a href="<url>" target="_blank">PDOK Locatie API</a> voor meer informatie.
  </p>
</div>
```

### 3.1 Context-paragrafen
- Begin de eerste context-`<p>` bij voorkeur met **`In dit voorbeeld …`** (meest gebruikt). Als dat niet past, gebruik dan **`Dit component maakt gebruik van …`** / **`Dit voorbeeld bevat …`** / **`Dit voorbeeld toont …`**.
- Beschrijf in **tegenwoordige tijd** wat er gebeurt en hoe. Concreet en feitelijk.
- Directe bediening-instructies in de **gebiedende wijs**: `Klik met de muis op de kaart om te tekenen.`
- Houd het bij 1–3 korte paragrafen. Geen lange lappen tekst.

### 3.2 Wanneer wél/niet een bulletlijst (`<ul>`)
Behoud bestaande opsommingen als <ul>/<li> of equivalente lijststructuur; herschrijf een lijst niet als doorlopende alinea als de tekst meerdere gelijkwaardige items bevat.
Als bestaande tekst meerdere opties, instellingen of varianten bevat, moet die inhoud als lijst terugkomen tenzij expliciet anders gevraagd.

**Wél bullets** als je ≥2 losse, gelijkwaardige items opsomt:
- instelmogelijkheden/opties/parameters;
- selectie- of tekenmodi;
- ondersteunde formaten/bronnen;
- voorbeeldbestanden.

**Geen bullets** bij:
- een enkel punt (gebruik een gewone `<p>`);
- lopende uitleg/verhaal. 
- Tekstblokken die al bullets, streepjes of genummerde items bevatten, gelden als lijst en mogen niet worden samengevoegd tot prose.

**Introductie-zin van een lijst** eindigt op een **dubbele punt** en staat in een eigen `<p>`, bijv.:
`<p>Instelmogelijkheden voor legenda:</p>`.

**Lijst-item stijl (kies één consistente vorm per lijst):**
- *Parameter-vorm* (voor technische instellingen): omschrijving eerst, parameter tussen haakjes aan het eind:
  `<li>Oppervlakte van een vlak (polygoon) laten zien (<code>showArea</code>)</li>` of `<li><code>tekst.basic</code>: een basistekst.</li>`
  Bestaande config-keys, parameters en placeholders in brontekst moeten letterlijk behouden blijven en als `<code>` worden weergegeven.
- *Label-vorm* (voor menselijke modi/keuzes): vetgedrukt label, dubbele punt, dan uitleg:
  `<li><strong>Single select</strong>: selecteer één object door te klikken in de kaart.</li>`
- Geneste `<ul>` is toegestaan voor sub-gedragingen onder één item.
- Lijst-items krijgen een afsluitende punt.

### 3.3 Inline-opmaak conventies
- `<code>…</code>`: API-namen, opties, parameters, config-objecten en property-namen. Deze blijven **Engels** en in originele casing: `SearchLocationOptions`, `drawOptions`, `showSegmentLength`, `getFeatureInfoOnSingleclick`, `collapsable`.
- `<strong>` of `<b>`: korte labels/kopjes (`<b>Uploaden</b>`, `<strong>Hover</strong>`). Voor `Let op` gebruik je `<b>Let op:</b>`.
- Componentnamen als code wanneer je naar het component verwijst: `ggc-map`, `ggc-legend`, `ggc-search-location`.
- Externe links: `<a href="…" target="_blank">Zichtbare tekst</a>`. Gebruik dit voor bijvoorbeeld PDOK-/API-documentatie.
- Waarschuwing zonder vet mag ook als losse zin: `Let op dat op de kaartlagen de optie getFeatureInfoOnSingleclick aangezet moet worden…`.

---

## 4. `<div page-tips>` — tip/callout (optioneel)
- Kort, meestal **één `<p>` met één zin**.
- Optioneel patroon: verwijs naar het configuratie-object waarmee de lezer verder kan afstemmen:
  `<p>Met <code>SnapOptions</code> kan snappen worden geconfigureerd.</p>`
  `<p>Met <code>AdditionalSuggestion</code> kan in andere bronnen worden gezocht.</p>`
- Gebruik alleen als er een zinvolle, aanvullende hint is. Anders weglaten.

---

## 5. Terminologie (verplicht consistent)
| Gebruik | Niet |
|---|---|
| kaart | map (in NL-tekst) |
| kaartlaag / kaartlagen | layer(s) |
| object(en) | feature(s) |
| objectinformatie | feature info (in lopende tekst) |
| legenda | legend |
| meten / tekenen | measuring / drawing |
| snappen / snapping | — |
| selecteren / markeren | — |
| aan-/uitzetten | aan/uit zetten |
| huidige locatie | — |

- Afkortingen consequent: `WMS`, `WMTS`, `WFS`, `OGC API`, `GeoJSON`, `GML`.
- `ggc-*` componentnamen altijd lowercase in code-font.

---

## 6. Basis- vs. uitgebreide varianten
Veel features bestaan als paar (basis + `(uitgebreid)`), gekoppeld via een "Extra opties"-toggle in de HTML.
- **Basisvoorbeeld**: houd tekst minimaal — introductie + 1 korte context-`<p>`. Meestal geen of een korte lijst.
- **Uitgebreid voorbeeld**: zelfde onderwerp, titel-suffix `(uitgebreid)`, en een uitgebreidere `Instelmogelijkheden voor …:`-lijst.
- Houd de introductie-zin van basis en uitgebreid inhoudelijk gelijk/parallel.

---

## 7. Werkwijze bij minimale input (AI-stappenplan)
Gegeven: korte feature-omschrijving + component + thema (en of het een 3D/uitgebreide variant is).

1. **Genereer `title`** met het patroon uit §1 (+ eventueel `(uitgebreid)`/`(3D)`).
2. **Genereer `introduction`** met het sjabloon uit §2 (één werkwoord-eerste zin, punt erachter).
3. **Genereer `page-introduction`**: `introduction`-binding + 1 context-`<p>` (`In dit voorbeeld …`). Voeg alleen een `<ul>` toe als er ≥2 opties zijn (§3.2), met consistente item-vorm.
4. **Voeg `<b>Let op:</b>`** toe als er een bekende randvoorwaarde is (bijv. `getFeatureInfoOnSingleclick` bij selecteren/objectinfo).
5. **Voeg `page-tips`** toe alleen als er een relevant config-object is om naar te verwijzen (§4).
6. **Controleer** tegen §5 (terminologie), sentence case in titel, punt-gebruik, en `<code>` voor alle API-namen.
7. **Laat technische placeholders niet staan**: vervang `Subtitel voor dit voorbeeld`, `In dit voorbeeld ..`, `Instelmogelijkheden voor ..`, en alle `TODO`-comments.

---

## 8. Volledig ingevuld voorbeeld (referentie)
Input: *"Objecten selecteren door te klikken op WFS/OGC API kaartlagen"*, component `ggc-map`, thema Informatie presenteren.

**`.component.ts`**
```ts
title: "Objecten selecteren op de kaart (WFS/OGC API)",
introduction: "Kies en markeer objecten door in de kaart te klikken.",
```

**`.component.html` → `page-introduction`**
```html
<div page-introduction>
  <p>{{ componentInfo.introduction }}</p>
  <p>
    Met het ggc-map component kan op ieder type kaartlaag een object
    geselecteerd worden. Selecteren werkt het beste met WFS en OGC API
    kaartlagen, omdat alle objecten in de browser beschikbaar zijn.
  </p>
  <p>Instelmogelijkheden voor de selectService:</p>
  <ul>
    <li><strong>Single select</strong>: selecteer één object door te klikken in de kaart.</li>
    <li><strong>Multi select</strong>: selecteer meerdere objecten door te klikken in de kaart.</li>
    <li><strong>Hover</strong>: selecteer één object door de muis over de kaart te bewegen.</li>
  </ul>
  <p>
    Let op dat op de kaartlagen de optie getFeatureInfoOnSingleclick aangezet
    moet worden om te kunnen selecteren op die lagen.
  </p>
</div>
```
