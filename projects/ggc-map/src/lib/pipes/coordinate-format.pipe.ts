import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "coordinateFormat" })
export class CoordinateFormatPipe implements PipeTransform {
  transform(
    coord: number[],
    decimals = 2,
    format = "RD: x = {x} m; y = {y} m"
  ): string {
    if (!coord) {
      return "";
    }
    const numberFmt = new Intl.NumberFormat("nl-NL", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
      useGrouping: false
    });

    const [x, y] = [numberFmt.format(coord[0]), numberFmt.format(coord[1])];
    return format.replace("{x}", x).replace("{y}", y);
  }
}
