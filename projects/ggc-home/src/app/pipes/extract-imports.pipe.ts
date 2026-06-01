import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "extractImportsPipe"
})
export class ExtractImportsPipe implements PipeTransform {
  transform(source: string | null): string {
    if (!source) return source ?? "";
    return this.getKadasterImports(source).join(" ");
  }

  private getKadasterImports(sourceCode: string): string[] {
    // NOSONAR: Regex used on trusted source code only (no user input).
    // Input size is limited; ReDoS not feasible in this context.
    const regex = /import\s+[^'"]*['"](@kadaster\/[^'"]+)['"]/g;
    const result = new Set<string>();

    for (const match of sourceCode.matchAll(regex)) {
      const fullImport = match[1]; // bijv: @kadaster/abc/def

      const parts = fullImport.split("/");
      if (parts.length >= 2) {
        result.add(`${parts[0]}/${parts[1]}`);
      }
    }

    return [...result];
  }
}
