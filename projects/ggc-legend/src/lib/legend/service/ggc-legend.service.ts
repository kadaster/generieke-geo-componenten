import { inject, Injectable } from "@angular/core";
import { CoreLegendService } from "./core-legend.service";

/**
 * Service die bulk‑acties aanbiedt voor legendes (expand/collapse).
 *
 * Deze wrapper gebruikt intern CoreDatasetLegendService en biedt
 * eenvoudige methodes om alle legendes met een bepaalde naam in één keer
 * uit te klappen of in te klappen.
 *
 * @remarks
 * - De service is `providedIn: 'root'` en is dus als singleton beschikbaar
 *   binnen de hele applicatie.
 * - Intern wordt `CoreDatasetLegendService` geïnjecteerd via `inject(...)`.
 *
 * @example
 * ```ts
 * // Typical usage in een component:
 * constructor(private legends: GgcDatasetLegendService) {}
 *
 * ngOnInit() {
 *   // Klap alle legenda items voor de kaart met mpaIndex "performance" uit.
 *   this.legends.expandAllLegends('performance');
 * }
 * ```
 */
@Injectable({
  providedIn: "root"
})
export class GgcLegendService {
  /**
   * Interne core‑service die de daadwerkelijke event‑stroom beheert.
   *
   * @private
   */
  private readonly coreLegendService: CoreLegendService =
    inject(CoreLegendService);

  /**
   * Klapt **alle** legenda items uit die overeenkomen voor een opgegeven kaart (mapIndex).
   *
   * @param mapIndex - De index van de kaart waarvoor je alle legenda items wilt uitklappen.
   *
   * @example
   * ```ts
   * // Alle legenda items voor kaart met index "analytics" uitklappen
   * ggcDatasetLegendService.expandAllLegends('analytics');
   * ```
   */
  public expandAllLegends(mapIndex: string): void {
    this.coreLegendService.expandAll$.next({
      mapIndex: mapIndex,
      expanded: true
    });
  }

  /**
   * Klapt **alle** legenda items uit die overeenkomen voor een opgegeven kaart (mapIndex).
   *
   * @param mapIndex De index van de kaart waarvoor je alle legenda items wilt inklappen.
   *
   * @example
   * ```ts
   * // Alle legenda items voor kaart met index "analytics" inklappen
   * ggcDatasetLegendService.collapseAllLegends('analytics');
   * ```
   */
  public collapseAllLegends(mapIndex: string): void {
    this.coreLegendService.expandAll$.next({
      mapIndex: mapIndex,
      expanded: false
    });
  }
}
