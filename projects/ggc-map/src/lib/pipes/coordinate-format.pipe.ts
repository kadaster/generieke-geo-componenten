import { Pipe, PipeTransform } from "@angular/core";

/**
 * Pipe voor het formatteren van coördinaten naar een leesbare string.
 *
 * De pipe:
 * - formatteert x- en y‑waarden met een vast aantal decimalen
 * - gebruikt de Nederlandse locale (`nl-NL`)
 * - ondersteunt een configureerbaar formaat met placeholders `{x}` en `{y}`
 *
 * Voorbeeld output:
 * `RD: x = 123456.78 m; y = 456789.12 m`
 */
@Pipe({ name: "coordinateFormat" })
export class CoordinateFormatPipe implements PipeTransform {
  /**
   * Transformeert een coördinaat naar een geformatteerde string.
   *
   * @param coord Coördinaat in de vorm `[x, y]`
   * @param decimals Aantal decimalen voor de coördinaatwaarden (default: 2)
   * @param format Formaatstring met `{x}` en `{y}` placeholders
   *
   * @returns De geformatteerde coördinaatstring of een lege string
   * wanneer de coördinaat niet is opgegeven.
   *
   * @example
   * ```html
   * {{ coord | coordinateFormat:2:'RD: x = {x} m; y = {y} m' }}
   * ```
   */
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
