/**
 * Controleert of een opgegeven `viewResolution` binnen het bereik valt van een laag,
 * gedefinieerd door optionele `minResolution` en `maxResolution` waarden.
 *
 * @param viewResolution - De resolutie van de huidige view (bijvoorbeeld kaartzoomniveau).
 * @param minResolution - (Optioneel) De minimale resolutie waarbij de laag zichtbaar moet zijn.
 * @param maxResolution - (Optioneel) De maximale resolutie waarbij de laag zichtbaar moet zijn.
 * @returns `true` als `viewResolution` binnen het bereik valt (groter dan of gelijk aan `minResolution`
 * en kleiner dan `maxResolution`), anders `false`.
 *
 * @example
 * ```ts
 * viewResolutionIsInLayerResolutionRange(50, 30, 100); // true
 * viewResolutionIsInLayerResolutionRange(20, 30, 100); // false
 * viewResolutionIsInLayerResolutionRange(120, undefined, 150); // true
 * ```
 */
const viewResolutionIsInLayerResolutionRange = (
  viewResolution: number,
  minResolution?: number,
  maxResolution?: number
): boolean => {
  const minResCheck: boolean = minResolution
    ? viewResolution >= minResolution
    : true;

  const maxResCheck: boolean = maxResolution
    ? viewResolution < maxResolution
    : true;

  return minResCheck && maxResCheck;
};

export { viewResolutionIsInLayerResolutionRange };
