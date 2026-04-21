## Lokaal opstarten ontwikkelomgeving

Run het script 'npm run build:all' zodat er een build beschikbaar is voor alle componenten in de dist folder. Start
vervolgens de applicatie met 'ng serve -o'.

In angular.json is de optie "vendorSourceMap" toegevoegd, zodat bij het starten van de applicatie ook de sourceMap van
de ggc worden toegevoegd en deze code te debuggen is.

## Lokaal aanpassingen van componenten testen

Als je lokaal een aanpassing maakt aan een (of meerdere) component(en) en deze gemakkelijk wilt testen binnen een andere
applicatie dan kan dat zonder dat hier eerst een snapshot voor hoeft te worden aangemaakt.

Om dit te doen maak je eerst lokaal een build van het desbetreffende component met:
`npm run build:<component-naam>`. Het component zal nu te vinden zijn binnen de `dist`-folder. Navigeer vanuit de
console naar het component in de `dist`-folder en voer binnen de folder van het component het volgende command
uit: `npm pack`.

In de afnemende applicatie voeg je deze toe
door: `npm install <path-vanuit-applicatie-naar-ggs-ggc-library>/ggs-ggc-library/dist/<component-naam>/<package-naam>.tgz`. De lokaal
gemaakte build wordt hiermee toegevoegd aan de `package.json` van de afnemende applicatie en kan nu gebruikt worden.

💡 Soms werkt het lokaal builden en installeren niet direct. Een van de volgende oplossingen kan hierbij helpen:

- Voeg in `angular.json` de volgende property toe: `projects.<project-name>.architect.build.options.preserveSymlinks: true`
- De cache kan in de weg zitten wanneer er meerdere keren een package wordt gebouwd met hetzelfde versienummer. Dit kan je voorkomen door in `projects/<package-naam>/package.json` het versienummer in te vullen.

## Linter

De Generieke Geo componenten maken gebruik van ESLint / Prettier. Je kunt je editor instellen dat 'On Save' de linter
draait en automatisch fixes doet.

### WebStorm/IntelliJ

Ga naar Settings en zoek op prettier (Languages & Frameworks > Javascript > Prettier)

- Kies [x] Automatic Prettier configuration
- Kies [x] Run on save
- Klik op [ OK ]

## Releaseproces van componenten

1. Zorg ervoor dat alle wijzigingen zijn gemerged
2. Start de ["Create releases" workflow](https://github.com/kadaster/generieke-geo-componenten/actions/workflows/publish.yml) op de `main` branch
3. Kies voor patch, minor of major
4. Kies de componenten die je wilt releasen en start de workflow

Wil je bijvoorbeeld voor 2 componenten een patch release en voor 2 andere componenten een minor release maken, start dan de workflow 2x.

## TS docs.

Om de TS docs HTML te genereren kun je het script `npm run tsdocs:generate` runnen.
Deze genereerd de HTML bestanden in ../docs-builder/tsdocs, hier kun je de index.html terugvinden en openen in je browser.

Als je de docs van je nieuwe component of service niet terugziet: Kijk dan of de `public-api.ts` in de `"entryPoints":[]` van `typedoc.json` staat.

(Bij het generen van de documentatie wordt de tsdocs folder meegenomen in build van de GGC documentatie: zie `build-docs.sh`)

## npm error na npm install met snapshot in GGC-Cesium

In sommige gevallen geeft npm install de volgende error.
`npm ERR! Cannot set properties of null (setting 'parent')`
`npm ERR! A complete log of this run can be found in: ...`
De genoemde log geeft echter geen verdere (nuttige) info om de fout te vinden.
Zoeken op google geeft de indicatie dat er ergens een peer-dependency niet opgelost kan worden.

Specifiec voor de ggc-library krijg je dit als je een snapshot gebruikt voor GGC-cesium.
Deze komt in confilct met de peerDependency op ggc-cesium in ggc-shared.
Het snapshot nummer wordt niet als hoger dan de gevraagde dependency herkend.

Praktisch kan dit opgelost met `npm install --legacy-peer-deps`
