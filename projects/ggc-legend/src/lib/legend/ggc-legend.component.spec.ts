import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Legend } from "../model/legend.model";
import { GgcLegendComponent } from "./ggc-legend.component";
import { CoreLegendService } from "./service/core-legend.service";
import { MapboxStyleService } from "../legend-mapbox/service/mapbox-style.service";
import { of } from "rxjs";
import {
  LayerType,
  LegendItem,
  MapboxStyle
} from "../legend-mapbox/model/legend-mapbox.model";
import { provideZoneChangeDetection } from "@angular/core";

describe("DatasetLegendComponent", () => {
  let component: GgcLegendComponent;
  let fixture: ComponentFixture<GgcLegendComponent>;
  let legendService: CoreLegendService;
  let mapboxStyleServiceSpy: jasmine.SpyObj<MapboxStyleService>;

  const collapsableDatasetLegend: Legend[] = [
    {
      name: "BAG Terugmeldingen",
      layerLegends: [
        {
          layerId: "bag",
          legend: undefined
        }
      ],
      expanded: false
    },
    {
      name: "BRT Terugmeldingen",
      layerLegends: [
        {
          layerId: "brtTerugmeldingen",
          legend: undefined
        }
      ],
      expanded: true
    }
  ];

  const legendIcon: Legend = {
    name: "BAG Terugmeldingen",
    layerLegends: [
      {
        layerId: "bagterugmeldingen",
        legend: [
          {
            imageUrl: "assets/icons/afgerond.svg",
            text: "afgerond"
          },
          {
            imageUrl: "assets/icons/afgewezen.svg",
            text: "afgewezen"
          }
        ]
      }
    ]
  };

  const legendMapbox: Legend = {
    name: "blub",
    layerLegends: [
      {
        layerId: "blub",
        legend: {
          name: "test",
          url: "assets/mapbox/testStyle.json"
        }
      }
    ]
  };

  const legendEmpty: Legend = {
    name: "BAG Terugmeldingen leeg",
    layerLegends: [
      {
        layerId: "bagterugmeldingen",
        legend: {
          legendUrl: ""
        }
      }
    ]
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [CoreLegendService]
    }).compileComponents();
  }));

  beforeEach(async () => {
    mapboxStyleServiceSpy = jasmine.createSpyObj("MapboxStyleService", [
      "getMapboxStyle",
      "removeRasterLayers",
      "getItems",
      "getLayersids"
    ]);

    await TestBed.configureTestingModule({
      providers: [
        { provide: MapboxStyleService, useValue: mapboxStyleServiceSpy },
        provideZoneChangeDetection()
      ]
      // eventueel je componenten of andere providers
    }).compileComponents();
    fixture = TestBed.createComponent(GgcLegendComponent);
    legendService = TestBed.inject(CoreLegendService);

    component = fixture.componentInstance;
    component["alwaysEnableLegends"] = true;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it(
    "when there is no dataset available, " +
      'it should display "Geen datasets geselecteerd!"',
    async () => {
      await fixture.whenStable();
      const element = fixture.debugElement.query(By.css("span"));
      const firstChildData = element.nativeElement.firstChild.data;
      expect(firstChildData).toEqual("Geen datasets geselecteerd!");
    }
  );

  it(
    "when the emptyLegendMessage is not set the default value is showed when de legendUrl value is empty, " +
      "it should display the emptyLegendMessage",
    async () => {
      component.legends = [JSON.parse(JSON.stringify(legendEmpty))];
      component.showEmptyLegendMessage = true;
      fixture.detectChanges();
      await fixture.whenStable();
      const element = fixture.debugElement.query(
        By.css(".ggc-dl-empty-legend-message")
      );
      const firstChildData = element.nativeElement.firstChild.data;
      expect(firstChildData).toEqual(" Geen legenda beschikbaar ");
    }
  );

  it(
    "when the emptyLegendMessage is set and dataset contains a empty legendUrl, " +
      "it should display the emptyLegendMessage value",
    async () => {
      component.legends = [JSON.parse(JSON.stringify(legendEmpty))];
      component.emptyLegendMessage = "aanpasbare lege legenda bericht";
      component.showEmptyLegendMessage = true;
      fixture.detectChanges();
      await fixture.whenStable();
      const element = fixture.debugElement.query(
        By.css(".ggc-dl-empty-legend-message")
      );
      const firstChildData = element.nativeElement.firstChild.data;
      expect(firstChildData).toEqual(" aanpasbare lege legenda bericht ");
    }
  );

  it(
    "when there is a dataset available, " +
      "it should display the datasetlegend name",
    async () => {
      component.legends = [JSON.parse(JSON.stringify(legendIcon))];
      fixture.detectChanges();
      await fixture.whenStable();
      const element = fixture.debugElement.query(By.css("span"));
      const firstChildData = element.nativeElement.firstChild.data.trim();
      expect(firstChildData).toEqual("BAG Terugmeldingen");
    }
  );

  it(
    "when there is a dataset available with a iconlist, " +
      "it should display the icon with text from the legend",
    async () => {
      component.legends = [JSON.parse(JSON.stringify(legendIcon))];
      component.showLegendsName = false;
      fixture.detectChanges();
      await fixture.whenStable();
      const imgElement = fixture.debugElement.query(
        By.css(".ggc-dl-iconlist-image")
      );
      const iconSrc = imgElement.properties.src;
      const iconAlt = imgElement.properties.alt;
      const textElement = fixture.debugElement.query(
        By.css(".ggc-dl-iconlist-text")
      );
      const textValue = textElement.nativeElement.firstChild.data;

      expect(iconSrc).toEqual("assets/icons/afgerond.svg");
      expect(iconAlt).toEqual("afgerond");
      expect(textValue).toEqual("afgerond");
    }
  );

  it(
    "when there is a dataset with vectorTileStyle, " +
      "the html should contain a ggc-legend-mapbox component with a legendItem with title = (zee)water",
    async () => {
      component.legends = [legendMapbox];
      mapboxStyleServiceSpy.getMapboxStyle.and.returnValue(
        // @ts-ignore
        of(testStyle as MapboxStyle)
      );
      mapboxStyleServiceSpy.getItems.and.returnValue(
        mapboxLegendItems as LegendItem[]
      );
      mapboxStyleServiceSpy.getLayersids.and.returnValue([
        "Onderlegger Nederland"
      ]);

      fixture.detectChanges();
      await fixture.whenStable();
      const mapboxNode = fixture.debugElement.query(
        By.css("ggc-legend-mapbox")
      );
      expect(mapboxNode).toBeDefined();
      const legendText = fixture.debugElement.query(
        By.css(".ggc-dl-mapbox-legend-text")
      );
      expect(legendText.nativeElement.firstChild.data).toEqual("(zee)water");
    }
  );

  it("the legend has a property collapsable=false by default. ", async () => {
    expect(component.collapsable).toEqual(false);
  });

  it("when legend has a property collapsable=true toggleLegend switches between expanded and !expanded", async () => {
    component.collapsable = true;
    component.legends = [JSON.parse(JSON.stringify(legendIcon))];
    component.toggleLegend(component.legends[0]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.legends[0].expanded).toEqual(true);
    const element = fixture.debugElement.query(By.css("button"));
    expect(element.children[0].classes["fa-angle-right"]).toBeTrue();
    expect(element.children[1].classes["fa-angle-down"]).toBeTrue();
    expect(
      element.children[0].classes["ggc-dl-dataset-toggle-collapsed"]
    ).toBeTrue();
    expect(
      element.children[1].classes["ggc-dl-dataset-toggle-expanded"]
    ).toBeTrue();
  });

  it("when legend has no property collapsable=true toggleLegend gives a console warning", async () => {
    console.warn = jasmine.createSpy("warn");
    component.collapsable = false;
    component.legends = [JSON.parse(JSON.stringify(legendIcon))];
    component.toggleLegend(component.legends[0]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(console.warn).toHaveBeenCalledWith(
      "Set DatasetLegendComponent.collapsable = true om legends in of uit te klappen."
    );
  });

  it("when expandAll$ from coreService emits value it shoud collapse and expand", async () => {
    //setup
    component.mapIndex = "Jan";
    // Provide copy to legends, so the tests cannot clash with each other
    component.legends = JSON.parse(JSON.stringify(collapsableDatasetLegend));
    expect(component.legends[0].expanded).toEqual(false);
    expect(component.legends[1].expanded).toEqual(true);

    // expand all
    legendService.expandAll$.next({ mapIndex: "Jan", expanded: true });
    await fixture.whenStable();

    // verify
    expect(component.legends[0].expanded).toEqual(true);
    expect(component.legends[1].expanded).toEqual(true);

    // collapse all
    legendService.expandAll$.next({ mapIndex: "Jan", expanded: false });
    await fixture.whenStable();

    // verify
    expect(component.legends[0].expanded).toEqual(false);
    expect(component.legends[1].expanded).toEqual(false);
  });

  it("when expandAll$ from coreService emits value with another mapIndex it should not collapse or expand", async () => {
    // setup
    component.mapIndex = "Kees";
    // Provide copy to legends, so the tests cannot clash with each other
    component.legends = JSON.parse(JSON.stringify(collapsableDatasetLegend));

    expect(component.legends[0].expanded).toEqual(false);
    expect(component.legends[1].expanded).toEqual(true);

    // expand all with another mapIndex
    legendService.expandAll$.next({ mapIndex: "NOT Kees", expanded: true });
    await fixture.whenStable();

    // verify
    expect(component.legends[0].expanded).toEqual(false);
    expect(component.legends[1].expanded).toEqual(true);
  });

  it("should add a new legend to the front if serviceName does not exist yet", () => {
    component["_legends"] = [{ name: "otherServiceName" }];
    component.addLegend({
      layerId: "id",
      serviceTitle: "serviceName",
      legend: { legendUrl: "url" }
    });
    expect(component["_legends"]).toEqual([
      {
        name: "serviceName",
        expanded: true,
        layerLegends: [
          {
            layerId: "id",
            serviceTitle: "serviceName",
            legend: { legendUrl: "url" }
          }
        ]
      },
      { name: "otherServiceName" }
    ]);
  });

  it("should sort legends in addLegend if legendIndices are provided", () => {
    component["_legends"] = [
      {
        name: "service1",
        expanded: true,
        layerLegends: [
          { layerId: "id1", legendIndex: 2, legend: { legendUrl: "url1" } }
        ]
      },
      {
        name: "service2",
        expanded: true,
        layerLegends: [
          { layerId: "id3", legendIndex: 1, legend: { legendUrl: "url3" } }
        ]
      }
    ];
    // default index = 0
    component.addLegend({
      layerId: "id2",
      serviceTitle: "service2",
      legend: { legendUrl: "url2" }
    });
    expect(component["_legends"]).toEqual([
      {
        name: "service1",
        expanded: true,
        layerLegends: [
          { layerId: "id1", legendIndex: 2, legend: { legendUrl: "url1" } }
        ]
      },
      {
        name: "service2",
        expanded: true,
        layerLegends: [
          { layerId: "id3", legendIndex: 1, legend: { legendUrl: "url3" } },
          {
            layerId: "id2",
            serviceTitle: "service2",
            legend: { legendUrl: "url2" }
          }
        ]
      }
    ]);
  });

  it("should use layerTitle as name if serviceName is not provided", () => {
    component.addLegend({
      layerId: "id",
      layerTitle: "layerTitle",
      legend: { legendUrl: "url" }
    });
    expect(component["_legends"]).toEqual([
      {
        name: "layerTitle",
        expanded: true,
        layerLegends: [
          {
            layerId: "id",
            layerTitle: "layerTitle",
            legend: { legendUrl: "url" }
          }
        ]
      }
    ]);
  });

  it("should remove a legend", () => {
    component["_legends"] = [
      {
        name: "layerTitle",
        layerLegends: [
          {
            layerId: "id",
            layerTitle: "layerTitle",
            legend: { legendUrl: "url" }
          }
        ]
      }
    ];
    component.removeLegend("id");
    expect(component["_legends"]).toEqual([]);
  });

  const testStyle = {
    version: 8,
    metadata: {
      "ol:webfonts":
        "https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/resources/fonts/{font-family}/{fontweight}{-fontstyle}.css",
      "gokoala:title-items": "id"
    },
    name: "",
    sprite: "",
    id: "achtergrondkaart_standaard",
    pitch: 0,
    center: [5.3878, 52.1561],
    glyphs:
      "https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/resources/fonts/{fontstack}/{range}.pbf",
    layers: [
      {
        id: "Onderlegger Nederland",
        type: LayerType.Fill,
        paint: {
          "fill-color": [
            "match",
            ["get", "vistext"],
            "(zee)water",
            "#80BDE3",
            "transparent"
          ]
        },
        source: "brt",
        "source-layer": "nederland"
      }
    ],
    sources: {
      brt: {
        type: "vector",
        tiles: [
          "https://api.pdok.nl/kadaster/brt-achtergrondkaart/ogc/v1/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}?f=mvt"
        ],
        minzoom: 0,
        maxzoom: 12
      }
    }
  };
  const mapboxLegendItems: LegendItem[] = [
    {
      name: "Onderlegger Nederland",
      title: "(zee)water",
      geoType: LayerType.Fill,
      style: [],
      sourceLayer: "nederland",
      properties: {
        vistext: "(zee)water",
        size: "1"
      },
      feature: undefined
    },
    {
      name: "Onderlegger Nederland",
      title: "Nederland",
      geoType: LayerType.Fill,
      style: [],
      sourceLayer: "nederland",
      properties: {
        size: "1"
      },
      feature: undefined
    }
  ];
});
