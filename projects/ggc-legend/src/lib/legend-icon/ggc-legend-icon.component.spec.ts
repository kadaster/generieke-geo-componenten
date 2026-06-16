import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GgcLegendIconComponent } from "./ggc-legend-icon.component";
import { By } from "@angular/platform-browser";

describe("GgcLegendIconComponent", () => {
  let fixture: ComponentFixture<GgcLegendIconComponent>;
  let component: GgcLegendIconComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GgcLegendIconComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcLegendIconComponent);
    component = fixture.componentInstance;
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should render list of icons", () => {
    component.icons = [
      {
        imageUrl: "http://test.com/icon1.svg",
        text: "Icon 1",
        iconDescription: "Icon 1 description"
      } as any,
      {
        imageUrl: "http://test.com/icon2.svg",
        text: "Icon 2",
        iconDescription: "Icon 2 description"
      } as any
    ];

    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css("li"));
    expect(items.length).toBe(2);
  });

  it("should render image and text correctly", () => {
    component.icons = [
      {
        imageUrl: "http://test.com/icon1.svg",
        text: "Icon 1",
        iconDescription: "Icon 1 description"
      } as any
    ];

    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css("img"));
    const text = fixture.debugElement.query(By.css(".ggc-dl-iconlist-text"));

    expect(img.nativeElement.getAttribute("src")).toBe(
      "http://test.com/icon1.svg"
    );
    expect(text.nativeElement.textContent.trim()).toBe("Icon 1");
  });

  it("should render empty list when no icons provided", () => {
    component.icons = [];

    fixture.detectChanges();

    const items = fixture.debugElement.queryAll(By.css("li"));
    expect(items.length).toBe(0);
  });
});
