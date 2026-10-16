import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { ExampleFormatComponent } from "./example-format.component";

describe("ExampleFormatComponent", () => {
  let fixture: ComponentFixture<ExampleFormatComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleFormatComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
      .overrideComponent(ExampleFormatComponent, { set: { template: "" } })
      .compileComponents();

    fixture = TestBed.createComponent(ExampleFormatComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("preserves its public input names and defaults", () => {
    fixture.componentRef.setInput("title", "Voorbeeld");
    fixture.componentRef.setInput("urlTSDocs", "/docs");
    fixture.componentRef.setInput("extraConfigLabel", "Boomconfiguratie");
    fixture.componentRef.setInput("extraConfigLanguage", "json");
    fixture.detectChanges();

    expect(fixture.componentInstance.title()).toBe("Voorbeeld");
    expect(fixture.componentInstance.urlTSDocs()).toBe("/docs");
    expect(fixture.componentInstance.extraConfigLabel()).toBe(
      "Boomconfiguratie"
    );
    expect(fixture.componentInstance.extraConfigLanguage()).toBe("json");
  });

  it("derives code paths from the existing path inputs", () => {
    fixture.componentRef.setInput("pathModule", "example/example.component.ts");
    fixture.componentRef.setInput("pathCodeScss", "example/example.scss");
    fixture.componentRef.setInput("pathKaartConfig", "example/kaart.json");
    fixture.componentRef.setInput("pathExtraConfig", "example/config.json");
    fixture.detectChanges();

    expect(fixture.componentInstance["_pathCodeTypescript"]()).toBe(
      "code/examples/example/example.component.ts"
    );
    expect(fixture.componentInstance["_pathCodeHtml"]()).toBe(
      "code/examples/example/example.component.html"
    );
    expect(fixture.componentInstance["_pathCodeScss"]()).toBe(
      "code/examples/example/example.scss"
    );
    expect(fixture.componentInstance["_pathKaartConfig"]()).toBe(
      "code/examples/example/kaart.json"
    );
    expect(fixture.componentInstance["_pathExtraConfig"]()).toBe(
      "code/examples/example/config.json"
    );

    const requests = httpTestingController.match(() => true);
    expect(requests.map(({ request }) => request.url)).toContain(
      "code/examples/example/example.component.scss"
    );
    requests.forEach((request) =>
      request.flush("", { headers: { "Content-Type": "text/plain" } })
    );
  });
});
