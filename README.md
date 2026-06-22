# Generieke Geo Componenten

## Workshop FOSS4G voorbeeld

Deze branch (`TMS-FOSS4G-example`) bevat opdrachten en voorbeelden voor de FOSS4G workshop over de Generieke Geo Componenten.

## Opdrachten

We hebben 3 opdrachten voorbereid in deze branch. In deze opdrachten ga je op verschillende manieren 
met de componenten aan de slag. Je kunt kiezen uit: 
* Opdracht 1 - Kaartviewer bouwen: component(en) toevoegen aan een kaartviewer
* Opdracht 2 - Componenten configureren: bestaande componenten in een kaarviewer aanpassen (bijvoorbeeld styling, layout, configuratie componenten)
* Opdracht 3 - Kaartviewer configureren: kaartlagen toevoegen aan een kaartviewer en configureren (bijvoorbeeld zoomniveau's of legenda)

Je kunt alle drie de opdrachten in Stackblitz openen:
https://stackblitz.com/github/kadaster/generieke-geo-componenten/tree/TMS-FOSS4G-example

### Opdracht 1: Kaartviewer bouwen

Dit is een basis opzet van een kaartviewer met alleen het [ggc-map component](https://generiekegeocomponenten.nl/layer-wmts) 
met een achtergrondkaart.
Voeg hier componenten aan toe zoals bijvoorbeeld kaartlaagkeuze ([ggc-dataset-tree](https://generiekegeocomponenten.nl/dataset-tree-basic)) 
of een zoekbalk [ggc-search-location](https://generiekegeocomponenten.nl/search-location).

Bonus: voeg ook andere kaartlagen toe of pas de styling/layout aan van de componenten die je hebt toegevoegd.


### Opdracht 2: Componenten configureren

In deze opdracht hebben we een kaartviewer gemaakt met meerdere componenten. Kijk hoe je deze aan kunt passen naar eigen wens.
Denk bijvoorbeeld aan styling of layout, of kijk naar de mogelijkheden van de verschillende componenten.

Bonus: voeg ook andere kaartlagen toe en zet deze standaard aan of uit met de ggc-dataset-tree, of toon de legenda in ggc-legend.

### Opdracht 3: Kaartviewer configureren

In deze basis viewer is het [ggc-map component](https://generiekegeocomponenten.nl/layer-wmts) toegevoegd 
met een aantal kaartlagen.
Pas de kaartconfiguratie aan en creëer eenvoudig je eigen kaartbeeld.
Denk aan het toevoegen van extra lagen (bijvoorbeeld de OGC API Features 3D) en het instellen van zoomniveaus.

## Handige links:

* [GGC Home](https://generiekegeocomponenten.nl): bekijk onze [voorbeelden](https://generiekegeocomponenten.nl/example-index), de [quick start](https://generiekegeocomponenten.nl/quick-start) of de [TSDocs](https://www.generiekegeocomponenten.nl/tsdocs/).
* [GitHub FOSS4G opdrachten](https://github.com/kadaster/generieke-geo-componenten/tree/TMS-FOSS4G-example): code lokaal openen op eigen device
* [PDOK](https://api.pdok.nl/): datasets voor kaartlagen

## Licentie

Dit project is gratis en open-source software, gelicentieerd onder de [European Union Public License (EUPL) v1.2](LICENSE.md). De documentatie in GGC Home (onder `/projects/ggc-home`) is gelicentieerd onder [Creative Commons Attribution Share Alike 4.0 International (`CC-BY-SA-4.0`)](https://creativecommons.org/licenses/by-sa/4.0/deed.nl).


© Documentatie: Dienst voor het kadaster en de openbare registers (Kadaster). Deze documentatie (met uitzondering van de TSDocs) is gelicentieerd onder CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

## Evaluatie
Aan het einde van de workshop horen we graag jullie reactie. [Hier vind je het evaluatieformulier](https://forms.office.com/Pages/ResponsePage.aspx?id=msacNDLIPUetjtQF0RHz9LJBQosJeWhJgLJ_lTXKoV5UOTVaREJJMEpNMFNJS1FJR1RDRUcxMFNQMi4u). Alvast bedankt voor het invullen!
