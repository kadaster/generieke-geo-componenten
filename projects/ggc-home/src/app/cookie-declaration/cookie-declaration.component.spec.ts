import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CookieDeclarationComponent } from "./cookie-declaration.component";

describe("CookieDeclarationComponent", () => {
  let fixture: ComponentFixture<CookieDeclarationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookieDeclarationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CookieDeclarationComponent);
    fixture.detectChanges();
  });

  it("should identify the application", () => {
    const applicationNameParagraph: HTMLParagraphElement | null =
      fixture.nativeElement.querySelector("main#main-content > h1 + p");

    expect(applicationNameParagraph?.textContent?.trim()).toBe(
      "Deze cookieverklaring geldt voor Generieke Geo Componenten."
    );
  });
});
