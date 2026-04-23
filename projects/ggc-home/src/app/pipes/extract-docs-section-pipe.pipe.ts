import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "extractDocsSectionPipe"
})
export class ExtractDocsSectionPipePipe implements PipeTransform {
  transform(
    source: string | null,
    key: string,
    language: "html" | "typescript"
  ): string {
    if (!source || !key) return source ?? "";

    let extracted = source;
    if (language === "html") {
      extracted = this.extractBlock(source, key);
    }

    const withoutSkips = this.removeSkips(extracted);
    return this.normalizeIndent(withoutSkips);
  }

  private extractBlock(source: string, key: string): string {
    const regex = new RegExp(
      String.raw`<!--\s*DOCS:START ${key}\s*-->([\s\S]*?)<!--\s*DOCS:END ${key}\s*-->`
    );

    const result = regex.exec(source);
    return result ? result[1] : "";
  }

  private normalizeIndent(block: string): string {
    const lines = block.replace(/\t/g, " ").split("\n");

    // verwijder lege regels aan begin
    while (lines.length > 0 && lines[0].trim() === "") {
      lines.shift();
    }

    // verwijder lege regels aan einde
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
      lines.pop();
    }

    const indents: number[] = [];

    for (const line of lines) {
      if (line.trim() === "") {
        continue;
      }

      const indentMatch = /^(\s*)/.exec(line);
      indents.push(indentMatch ? indentMatch[1].length : 0);
    }

    const minIndent = indents.length > 0 ? Math.min(...indents) : 0;

    return lines.map((line) => line.slice(minIndent)).join("\n");
  }

  private removeSkips(block: string): string {
    let skipping = false;
    const result: string[] = [];

    for (const line of block.split("\n")) {
      if (line.includes("DOCS-SKIP:START")) {
        skipping = true;
        continue;
      }
      if (line.includes("DOCS-SKIP:END")) {
        skipping = false;
        continue;
      }
      if (!skipping) result.push(line);
    }

    return result.join("\n");
  }
}
