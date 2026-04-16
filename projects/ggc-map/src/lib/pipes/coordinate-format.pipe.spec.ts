import { CoordinateFormatPipe } from "./coordinate-format.pipe";

describe("CoordinateFormatPipe", () => {
  it("create an instance", () => {
    const pipe = new CoordinateFormatPipe();
    expect(pipe).toBeTruthy();
  });

  it("createCoordinateformat() should return an string based on coordinate, template and decimalDigits", () => {
    const pipe = new CoordinateFormatPipe();
    expect(pipe.transform([12.345689, 78.910121], 3)).toEqual(
      "RD: x = 12,346 m; y = 78,910 m"
    );
  });

  it("createCoordinateformat() should return an string based on coordinate, template and decimalDigits in alternate format", () => {
    const pipe = new CoordinateFormatPipe();
    expect(
      pipe.transform([12.345689, 78.910121], 2, "TESTFORMAT {x}|{y}")
    ).toEqual("TESTFORMAT 12,35|78,91");
  });
});
