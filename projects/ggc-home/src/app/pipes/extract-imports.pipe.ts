import { Pipe, PipeTransform } from "@angular/core";
import ts from "typescript";

@Pipe({
  name: "extractImportsPipe"
})
export class ExtractImportsPipe implements PipeTransform {
  transform(source: string | null, key: string): string {
    if (!source || !key) return source ?? "";
    return this.getKadasterImports(source, key).join(" ");
  }

  private getKadasterImports(sourceCode: string, key: string): string[] {
    const sourceFile = ts.createSourceFile(
      "file.ts",
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const imports: string[] = [];

    sourceFile.forEachChild((node) => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier
          .getText()
          .replace(/['"]/g, "");

        if (moduleSpecifier.startsWith(key)) {
          const parts = moduleSpecifier.split("/");

          // "@scope/package" = eerste 2 delen
          imports.push(
            parts.length >= 2 ? `${parts[0]}/${parts[1]}` : moduleSpecifier
          );
        }
      }
    });

    return [...new Set(imports)];
  }
}
