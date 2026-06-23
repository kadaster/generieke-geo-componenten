const defaultWebServices = [
  {
    "url": "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
    "type": "wmts",
    "layers": [
      {
        "layerId": "brtAchtergrondkaartStandaard",
        "title": "BRT achtergrond kaart Standaard (WMTS)",
        "layerName": "standaard",
        "visible": false,
        "zIndex": -20
      },
      {
        "layerId": "brtAchtergrondkaartGrijs",
        "title": "BRT achtergrond kaart Grijs (WMTS)",
        "layerName": "grijs",
        "visible": true,
        "zIndex": -20
      }
    ]
  },
  {
    "type": "wms",
    "url": "https://service.pdok.nl/hwh/luchtfotorgb/wms/v1_0",
    "layers": [
      {
        "layerId": "luchtfoto",
        "title": "Luchtfoto Actueel Ortho 8cm RGB (WMS)",
        "visible": false,
        "layerName": "Actueel_orthoHR",
        "zIndex": -20
      }
    ]
  },
  {
    "url": "https://service.pdok.nl/kadaster/bestuurlijkegebieden/wms/v1_0",
    "type": "wms",
    "layers": [
      {
        "layerId": "landsgrens",
        "title": "Landsgrens",
        "layerName": "landgebied",
        "visible": false
      },
      {
        "layerId": "provincies",
        "title": "Provincies",
        "layerName": "provinciegebied",
        "visible": false
      },
      {
        "layerId": "gemeenten",
        "title": "Gemeenten",
        "layerName": "gemeentegebied",
        "visible": true
      }
    ]
  }
];

const mapElement = document.querySelector("#ggc-map");
const datasetTreeElement = document.querySelector("#ggc-dataset-tree");
const searchLocationElement = document.querySelector("#ggc-search-location");
const webservicesTextarea = document.querySelector("#webservices");
const applyConfigButton = document.querySelector("#apply-config");
const clearEventsButton = document.querySelector("#clear-events");
const eventLog = document.querySelector("#event-log");

webservicesTextarea.value = JSON.stringify(defaultWebServices, null, 2);

customElements.whenDefined("ggc-map-element").then(() => {
  applyWebServices();
});

customElements.whenDefined("ggc-dataset-tree-element").then(() => {
  applyDatasetTreeConfig();
});

customElements.whenDefined("ggc-search-location-element").then(() => {
  searchLocationElement.searchLocationOptions = {zoomToResult: true, markResult: true, mapIndex: 'plain-js-demo-map'};
})

function applyDatasetTreeConfig() {
  datasetTreeElement.themes = [
    {
      "themeName": "Achtergrond kaart",
      "datasets": [
        {
          "datasetName": "BRT Achtergrond",
          "services": [
            {
              "layers": [
                { "layerId": "brtAchtergrondkaartStandaard" },
                { "layerId": "brtAchtergrondkaartGrijs" }
              ]
            }
          ]
        },
        {
          "datasetName": "Luchtfoto",
          "services": [
            {
              "layers": [{ "layerId": "luchtfoto" }]
            }
          ]
        }
      ]
    },
    {
      "themeName": "Een andere data verzameling",
      "datasets": [
        {
          "datasetName": "Bestuurlijke gebieden (wms)",
          "services": [
            {
              "layers": [
                { "layerId": "landsgrens" },
                { "layerId": "provincies" },
                { "layerId": "gemeenten" }
              ]
            }
          ]
        }
      ]
    }
  ];
}

applyConfigButton.addEventListener("click", applyWebServices);
clearEventsButton.addEventListener("click", () => {
  eventLog.replaceChildren();
});

mapElement.addEventListener("events", (event) => {
  appendEvent(event.detail);
});

function applyWebServices() {
  try {
    mapElement.webServices = JSON.parse(webservicesTextarea.value);
    applyConfigButton.removeAttribute("aria-invalid");
  } catch (error) {
    applyConfigButton.setAttribute("aria-invalid", "true");
    appendEvent({
      type: "CONFIGURATION_ERROR",
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

function appendEvent(eventDetail) {
  const item = document.createElement("li");
  const timestamp = new Date().toLocaleTimeString("nl-NL");
  const eventType = eventDetail?.type ?? "UNKNOWN";
  const message = eventDetail?.message ? ` - ${eventDetail.message}` : "";

  item.textContent = `${timestamp} ${eventType}${message}`;
  eventLog.prepend(item);
}
