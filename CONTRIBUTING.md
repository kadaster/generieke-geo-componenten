# Bijdragen aan Generieke Geo Componenten

Allereerst bedankt dat je wilt bijdragen aan dit project! Zonder jouw input wordt dit nooit een beter open source project.

## Code of Conduct

Dit project hanteert een [Code of Conduct](CODE_OF_CONDUCT.md). Door bij te dragen aan dit project ga je akkoord met de voorwaarden hiervan.

## Hoe kan je bijdragen?

Er zijn verschillende manieren om bij te dragen aan dit project:

### Meld een bug

Heb je een bug gevonden? Maak dan een [issue](https://github.com/kadaster/generieke-geo-componenten/issues) aan met:

- Een duidelijke en beschrijvende titel
- Stappen om de bug te reproduceren
- In welk component de bug optreedt
- Verwacht gedrag vs. daadwerkelijk gedrag
- Screenshots of foutmeldingen (indien van toepassing)
- Je omgeving (OS, browserversie, etc.)

### Features voorstellen

Heb je een idee voor een nieuwe feature? Open een issue met:

- Een duidelijke beschrijving van de feature
- Benoem de componenten waarvoor de faeture bedoeld is
- Waarom deze feature waardevol zou zijn
- Eventuele voorbeelden of mockups

Een nieuwe feature moet natuurlijk wel passen binnen het generieke karakter van deze repo. Houd hiermee rekening en stem eerst af met de maintainers voordat je begint met het ontwikkelen van een nieuwe feature.

### Documentatie verbeteren

Documentatie kan altijd beter! Pull requests voor verbeteringen aan de documentatie zijn zeer welkom.

### Code bijdragen

Wil je code bijdragen? Volg dan onderstaand proces.

Stem je voorstel eerst af via een GitHub issue om teleurstellingen te voorkomen.

## Ontwikkelproces

### 1. Fork en clone de repository

```bash
git clone git@github.com:kadaster/generieke-geo-componenten.git
cd generieke-geo-componenten
```

### 2. Maak een nieuwe branch

```bash
git checkout -b feature/mijn-nieuwe-feature
```

Of voor bugfixes:

```bash
git checkout -b fix/issue-nummer-korte-beschrijving
```

### 3. Installeer dependencies

```bash
npm install
```

### 4. Maak je wijzigingen

- Schrijf duidelijke, leesbare code
- Voeg tests toe voor nieuwe functionaliteit, zorg dat de coverage niet achteruit gaat
- Update documentatie waar nodig

### 5. Test je wijzigingen, controleer linting

```bash
npm test
npm lint:all
```

### 6. Commit je wijzigingen

Gebruik duidelijke commit-messages en benoem het issue nummer.

Voorbeeld:

```
#123 - Angular 22 update, release notes bijgewerkt
```

### 7. Push naar je fork

```bash
git push origin feature/mijn-nieuwe-feature
```

### 8. Open een Pull Request

- Geef je PR een duidelijke titel en beschrijving
- Link gerelateerde issues
- Zorg dat alle tests slagen
- Draai lokaal [SonarQube for IDE](https://www.sonarsource.com/products/sonarqube/ide/)
- Wacht op review van een maintainer

## Ontwikkelomgeving

In de [DEVELOPING](DEVELOPING.md) handleiding staat beschreven wat je nodig hebt om lokaal te kunnen ontwikkelen en testen.

## Toegankelijkheid (Accessibility)

Vanwege toepassing binnen Nederlandse overheidsprojecten is toegankelijkheid wettelijk verplicht:

- Volg [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) niveau AA
- Test met screenreaders (NVDA/JAWS)
- Zorg voor keyboard navigatie
- Gebruik semantische HTML
- Test kleurcontrast (minimaal 4.5:1)

## Beveiliging (Security)

- Meld beveiligingsproblemen **NIET** via publieke issues
- Volg het Kadaster Responsible Disclosure / Security Policy:
    - Nederlands: https://www.kadaster.nl/disclaimer/responsible-disclosure
    - English: https://www.kadaster.nl/about-us/legal-disclaimer/responsible-disclosure

## Licentie

Door bij te dragen aan dit project ga je ermee akkoord dat je source code bijdragen worden gelicenseerd onder de EUPL v1.2 licentie, en bijdragen aan documentatie in GGC Home worden gelicentieerd onder de CC BY-SA 4.0 licentie.

## Erkenning

Bijdragers worden indien gewenst vermeld in:

- de releasenotes

---

Bedankt voor je bijdrage!

_Dit project wordt onderhouden door [team GGS](mailto:ggs@kadaster.nl) van het Kadaster en de open source community._
