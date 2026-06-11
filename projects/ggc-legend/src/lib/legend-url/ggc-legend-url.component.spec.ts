import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { GgcLegendUrlComponent } from "./ggc-legend-url.component";
import { DomSanitizer } from "@angular/platform-browser";
import { provideHttpClient } from "@angular/common/http";

class MockSanitizer {
  bypassSecurityTrustHtml(value: string) {
    return value;
  }
}

describe("GgcLegendUrlComponent", () => {
  let fixture: ComponentFixture<GgcLegendUrlComponent>;
  let component: GgcLegendUrlComponent;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GgcLegendUrlComponent,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DomSanitizer, useClass: MockSanitizer }
      ]
    });

    fixture = TestBed.createComponent(GgcLegendUrlComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should detect svg url correctly", () => {
    component.legend = { legendUrl: "http://test.com/icon.svg" } as any;

    expect(component.isSvg()).toBeTrue();
  });

  it("should fetch svg when legend is set", () => {
    component.legend = {
      legendUrl: "http://test.com/icon.svg"
    } as any;

    fixture.detectChanges();

    const req = httpMock.expectOne("http://test.com/icon.svg");
    expect(req.request.method).toBe("GET");

    req.flush("<svg></svg>");
  });

  it("should sanitize and store svg content", () => {
    component.legend = {
      legendUrl: "http://test.com/icon.svg"
    } as any;

    const rawSvg = `<svg><script>alert(1)</script></svg>`;

    fixture.detectChanges();

    const req = httpMock.expectOne("http://test.com/icon.svg");
    req.flush(rawSvg);

    expect(component.svgContent()).toBeTruthy();
    expect(component.svgContent()).toBe("<svg></svg>");
  });

  it("should not fetch when url is not svg", () => {
    component.legend = {
      legendUrl: "http://test.com/icon.png"
    } as any;

    fixture.detectChanges();

    httpMock.expectNone("http://test.com/icon.png");
  });

  it("should not fetch when legend is empty", () => {
    component.legend = { legendUrl: null } as any;

    fixture.detectChanges();

    httpMock.expectNone(() => true);
  });
});
