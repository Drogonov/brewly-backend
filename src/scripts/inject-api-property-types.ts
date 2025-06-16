// scripts/inject-api-property-types.ts
import { Project, SyntaxKind } from "ts-morph";
import * as path from "path";

async function main() {
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, "../../tsconfig.json"),
  });

  // pick up all your dto files
  const files = project.addSourceFilesAtPaths("src/**/*.dto.ts");

  for (const sf of files) {
    let madeChange = false;

    for (const cls of sf.getClasses()) {
      for (const prop of cls.getProperties()) {
        const typeNode = prop.getTypeNode();
        if (!typeNode) continue;

        // figure out if it's an array or a single TypeReference
        let rawTypeName: string;
        let isArray = false;
        if (typeNode.getKind() === SyntaxKind.ArrayType) {
          isArray = true;
          rawTypeName = (typeNode as any).getElementTypeNode().getText();
        } else if (typeNode.getKind() === SyntaxKind.TypeReference) {
          rawTypeName = typeNode.getText();
        } else {
          continue;
        }

        // determine which DTO class this should map to:
        // - if it's already a *Dto, just use that
        // - else if it's an I*Response, strip the leading I and add Dto
        let className: string;
        if (rawTypeName.endsWith("Dto")) {
          className = rawTypeName;
        } else if (/^I.*Response$/.test(rawTypeName)) {
          className = rawTypeName.slice(1) + "Dto";
        } else {
          continue;
        }

        // ensure we have an import for that DTO
        const hasImport = sf.getImportDeclarations().some(impt =>
          impt.getNamedImports().some(n => n.getName() === className)
        );
        if (!hasImport) {
          const declSF = project.getSourceFiles().find(sf2 =>
            sf2.getClass(className)
          );
          if (!declSF) {
            console.warn(
              `⚠️ Couldn’t locate class ${className}, skipping ${sf.getBaseName()}:${prop.getName()}`
            );
            continue;
          }
          let rel = path
            .relative(path.dirname(sf.getFilePath()), declSF.getFilePath())
            .replace(/\\/g, "/")
            .replace(/\.ts$/, "");
          if (!rel.startsWith(".")) rel = "./" + rel;
          sf.addImportDeclaration({
            namedImports: [className],
            moduleSpecifier: rel,
          });
        }

        // now inject into the @ApiProperty / @ApiPropertyOptional decorator
        for (const deco of prop.getDecorators()) {
          if (!/ApiProperty(Optional)?/.test(deco.getName())) continue;
          const [arg] = deco.getArguments();
          const obj = arg?.asKind(SyntaxKind.ObjectLiteralExpression);
          if (!obj || obj.getProperty("type")) continue;

          // add `type: () => ClassDto`
          obj.addPropertyAssignment({
            name: "type",
            initializer: `() => ${className}`,
          });
          if (isArray) {
            obj.addPropertyAssignment({
              name: "isArray",
              initializer: "true",
            });
          }
          madeChange = true;
        }
      }
    }

    if (madeChange) {
      await sf.save();
      console.log(`✔︎ Patched ${sf.getBaseName()}`);
    }
  }

  console.log("All done!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});