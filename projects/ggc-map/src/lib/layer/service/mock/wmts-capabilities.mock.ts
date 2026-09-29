/**
 * Bouwt een minimale, maar voor `ol`'s `optionsFromCapabilities` volledig
 * geldige WMTS-capabilities structuur op, zodat tests een bruikbare
 * `WMTS`-source kunnen construeren zonder te crashen.
 */
export function createWmtsCapabilitiesMock(
  layerIdentifier?: string,
  includeFeatureInfoUrl = false
): Record<string, any> {
  return {
    ...(includeFeatureInfoUrl && {
      OperationsMetadata: {
        GetFeatureInfo: {
          DCP: { HTTP: { Get: [{ href: "https://example.com/wmts" }] } }
        }
      }
    }),
    Contents: {
      Layer: [
        {
          Identifier: layerIdentifier,
          TileMatrixSetLink: [{ TileMatrixSet: "EPSG:3857" }],
          Format: ["image/png"],
          Style: [{ Identifier: "default", Title: "default", isDefault: true }],
          ResourceURL: [
            {
              resourceType: "tile",
              format: "image/png",
              template:
                "https://example.com/wmts/{TileMatrix}/{TileCol}/{TileRow}.png"
            }
          ]
        }
      ],
      TileMatrixSet: [
        {
          Identifier: "EPSG:3857",
          SupportedCRS: "EPSG:3857",
          TileMatrix: [
            {
              Identifier: "0",
              ScaleDenominator: 559082264.0287178,
              TopLeftCorner: [-20037508.342789244, 20037508.342789244],
              TileWidth: 256,
              TileHeight: 256,
              MatrixWidth: 1,
              MatrixHeight: 1
            }
          ]
        }
      ]
    }
  };
}
