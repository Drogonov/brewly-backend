// scripts/inject-api-property-types.ts
import { Project, SyntaxKind } from "ts-morph";
import * as path from "path";

async function main() {
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, "../../tsconfig.json"),
  });

  // grab all your dto files
  const files = project.addSourceFilesAtPaths("src/**/*.dto.ts");

  for (const sf of files) {
    let madeChange = false;

    for (const cls of sf.getClasses()) {
      for (const prop of cls.getProperties()) {
        const typeNode = prop.getTypeNode();
        if (!typeNode) continue;

        // 1) figure out raw name & whether it's an array
        let rawName: string;
        let isArray = false;

        if (typeNode.getKind() === SyntaxKind.ArrayType) {
          isArray = true;
          rawName = (typeNode as any).getElementTypeNode().getText();
        } else if (typeNode.getKind() === SyntaxKind.TypeReference) {
          rawName = typeNode.getText();
        } else {
          continue;
        }

        // 2) determine what kind of "type" to inject
        let swaggerTypeExpr: string | null = null;
        let className: string | null = null;

        // a) nested DTO already
        if (rawName.endsWith("Dto")) {
          swaggerTypeExpr = rawName;
          className = rawName;
        }
        // b) interface I*Response → XxxResponseDto
        else if (/^I.*Response$/.test(rawName)) {
          className = rawName.slice(1) + "Dto";
          swaggerTypeExpr = className;
        }
        // c) primitive
        else {
          const prim = rawName.toLowerCase();
          if (prim === "number") {
            swaggerTypeExpr = "Number";
          } else if (prim === "string") {
            swaggerTypeExpr = "String";
          } else if (prim === "boolean") {
            swaggerTypeExpr = "Boolean";
          }
        }
        if (!swaggerTypeExpr) continue;

        // 3) ensure import for class DTOs
        if (className) {
          const hasImport = sf.getImportDeclarations().some(impt =>
            impt.getNamedImports().some(n => n.getName() === className)
          );
          if (!hasImport) {
            const declSF = project.getSourceFiles().find(sf2 =>
              sf2.getClass(className!)
            );
            if (!declSF) {
              console.warn(`⚠️ Missing DTO class ${className} for ${sf.getBaseName()}:${prop.getName()}`);
              continue;
            }
            let rel = path.relative(
              path.dirname(sf.getFilePath()),
              declSF.getFilePath()
            ).replace(/\\/g, "/").replace(/\.ts$/, "");
            if (!rel.startsWith(".")) rel = "./" + rel;
            sf.addImportDeclaration({
              namedImports: [className],
              moduleSpecifier: rel,
            });
          }
        }

        // 4) inject into @ApiProperty / @ApiPropertyOptional
        for (const deco of prop.getDecorators()) {
          if (!/ApiProperty(Optional)?/.test(deco.getName())) continue;
          const [arg] = deco.getArguments();
          const obj = arg?.asKind(SyntaxKind.ObjectLiteralExpression);
          if (!obj || obj.getProperty("type")) continue;

          // add `type: () => XxxDto` or `() => Number`
          obj.addPropertyAssignment({
            name: "type",
            initializer: `() => ${swaggerTypeExpr}`,
          });

          // if array, also `isArray: true`
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
      console.log(`✔︎ Updated ${sf.getBaseName()}`);
    }
  }

  console.log("✅ All done!");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});