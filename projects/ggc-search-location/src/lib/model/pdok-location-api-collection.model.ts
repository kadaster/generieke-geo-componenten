/**
 * Resultaat van de PDOK collections endpoint, bevat een lijst van doorzoekbare bronnen.
 */
export interface PdokLocationApiResult {
  /** Lijst met beschikbare collecties zoals adressen, percelen, gemeenten, etc. */
  collections: PdokLocationApiCollectionModel[];
  /** API-gerelateerde links voor navigatie of metadata. */
  links: PdokLocationApiLink[];
  /** Het totaal aantal teruggegeven collecties. */
  numberReturned: number;
}

/**
 * Representatie van een specifieke PDOK-collectie (bron).
 */
export interface PdokLocationApiCollectionModel {
  /** De technische naam van de collectie (bijv. 'adres'). */
  id: string;
  /** De leesbare titel van de collectie. */
  title: string;
  /** De versie van de dataset. */
  version: number;
  /** Template die beschrijft hoe resultaten uit deze collectie getoond moeten worden. */
  displayTemplate: string;
  /** Links naar metadata of de collectie-bron zelf. */
  links: PdokLocationApiLink[];
}

/**
 * Generiek link-object voor PDOK API endpoints.
 */
export interface PdokLocationApiLink {
  /** De relatie van de link (bijv. 'self', 'alternate'). */
  rel: string;
  /** Het MIME-type van de data (meestal 'application/json'). */
  type: string;
  /** De titel van de gelinkte bron. */
  title: string;
  /** De daadwerkelijke URL. */
  href: string;
}

/**
 * Configuratie-object voor het instellen van actieve collecties tijdens het zoeken.
 */
export interface SearchCollection {
  /** ID van de collectie (bijv. 'perceel'). */
  id: string;
  /** Versienummer van de collectie. */
  version: number;
  /** Relevantie-score (0.0 tot 1.0) om resultaten uit deze collectie te prioriteren, waarbij 1.0 het hoogste is. */
  relevance: number;
}

/**
 * De volledige response van een PDOK Location API zoekopdracht.
 */
export interface PdokLocationApiSearchResponse {
  /** De lijst met gevonden geografische objecten (suggesties). */
  features: PdokLocationApiSearchFeature[];
  /** Navigatie links. */
  links: PdokLocationApiLink[];
  /** Aantal gevonden resultaten. */
  numberReturned: number;
  /** Tijdstip van de zoekopdracht. */
  timestamp: string;
  /** Type van de response (meestal 'FeatureCollection'). */
  type: string;
}

/**
 * Een specifiek zoekresultaat (Feature) uit de PDOK Location API.
 */
export interface PdokLocationApiSearchFeature {
  /** De begrenzende rechthoek (bounding box) van het object [minx, miny, maxx, maxy]. */
  bbox: number[];
  /** De geometrie van het object (indien meegeleverd in de search response). */
  geometry: object;
  /** Unieke identifier van het object. */
  id: string;
  /** De eigenschappen van het resultaat. */
  properties: {
    /** Geometrietype binnen de collectie (bijv. 'point', 'polygon'). */
    collection_geometry_type: string;
    /** Uit welke collectie dit resultaat komt. */
    collection_id: string;
    /** Versie van de broncollectie. */
    collection_version: string;
    /** De geformatteerde weergavenaam voor de gebruiker. */
    display_name: string;
    /** Geformatteerde naam met HTML-tags voor highlighting van de zoekterm. */
    highlight: string;
    href: string;
    /** De berekende relevantie-score. */
    score: number;
  };
  /** GeoJSON type ('Feature'). */
  type: string;
}

/**
 * Het detail-object dat wordt opgehaald wanneer een specifiek zoekresultaat wordt geselecteerd.
 * Bevat vaak de volledige geometrie voor markering op de kaart.
 */
export interface PdokLocationApiCollectionFeature {
  /** GeoJSON type ('Feature'). */
  type: string;
  /** Object met alle attributen van het specifieke object. */
  properties: object;
  /** De volledige geometrie van het object (Point, Polygon, etc.). */
  geometry: object;
  /** Identifier van het object. */
  id: string;
  /** Gerelateerde links. */
  links: PdokLocationApiLink[];
}
