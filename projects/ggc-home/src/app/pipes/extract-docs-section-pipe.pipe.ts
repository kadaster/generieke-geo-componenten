import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "extractDocsSectionPipe"
})
export class ExtractDocsSectionPipePipe implements PipeTransform {
  transform(source: string | null, key: string): string {
    if (!source || !key) {
      return source ?? "";
    }

    const regex = new RegExp(
      `<!--\\s*DOCS:START ${key}\\s*-->([\\s\\S]*?)<!--\\s*DOCS:END ${key}\\s*-->`
    );

    const result = regex.exec(source);
    if (!result) {
      return "";
    }

    return this.normalizeIndent(result[1]);
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
}
