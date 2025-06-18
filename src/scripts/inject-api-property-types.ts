// scripts/inject-api-property-types.ts
import { Project, SyntaxKind } from "ts-morph";
import * as path from "path";

async function main() {
  const project = new Project({
    tsConfigFilePath: path.resolve(__dirname, "../../tsconfig.json"),
  });

  const files = project.addSourceFilesAtPaths("src/**/*.dto.ts");
  for (const sf of files) {
    let madeChange = false;

    for (const cls of sf.getClasses()) {
      for (const prop of cls.getProperties()) {
        const typeNode = prop.getTypeNode();
        if (!typeNode) continue;

        // 1) detect raw type name & array-ness
        let rawName: string;
        let declaredIsArray = false;
        if (typeNode.getKind() === SyntaxKind.ArrayType) {
          declaredIsArray = true;
          rawName = (typeNode as any).getElementTypeNode().getText();
        } else if (typeNode.getKind() === SyntaxKind.TypeReference) {
          rawName = typeNode.getText();
        } else {
          continue;
        }

        // 2) pick the right swagger‐decorator “type” target
        let typeIdentifier: string | null = null;
        let needsImportOf: string | null = null;

        if (rawName.endsWith("Dto")) {
          // already a DTO
          typeIdentifier = rawName;
          needsImportOf = rawName;
        }
        else if (/^I.*Response$/.test(rawName)) {
          // IThingResponse → ThingResponseDto
          needsImportOf = rawName.slice(1) + "Dto";
          typeIdentifier = needsImportOf;
        }
        else {
          // plain primitives
          const p = rawName.toLowerCase();
          if (p === "number")      typeIdentifier = "Number";
          else if (p === "string") typeIdentifier = "String";
          else if (p === "boolean")typeIdentifier = "Boolean";
        }
        if (!typeIdentifier) continue;

        // 3) ensure import if needed (for DTO classes)
        if (needsImportOf) {
          const already = sf.getImportDeclarations().some(impt =>
            impt.getNamedImports().some(n => n.getName() === needsImportOf)
          );
          if (!already) {
            const decl = project.getSourceFiles().find(f2 =>
              f2.getClass(needsImportOf!)
            );
            if (decl) {
              let rel = path.relative(
                path.dirname(sf.getFilePath()),
                decl.getFilePath()
              ).replace(/\\/g, "/").replace(/\.ts$/, "");
              if (!rel.startsWith(".")) rel = "./" + rel;
              sf.addImportDeclaration({
                namedImports: [needsImportOf],
                moduleSpecifier: rel,
              });
            } else {
              console.warn(
                `⚠️ DTO class ${needsImportOf} not found for ${sf.getBaseName()}:${prop.getName()}`
              );
            }
          }
        }

        // 4) adjust @ApiProperty / Optional
        for (const deco of prop.getDecorators()) {
          if (!/ApiProperty(Optional)?/.test(deco.getName())) continue;
          const [arg] = deco.getArguments();
          const obj = arg?.asKind(SyntaxKind.ObjectLiteralExpression);
          if (!obj) continue;

          // see if there's an existing "type" prop
          const existing = obj.getProperty("type");
          if (existing) {
            // if it’s an ArrayLiteral ([FooDto]), remove it so we can re-add correctly
            const init = (existing as any).getInitializer?.();
            if (
              init?.getKind() === SyntaxKind.ArrayLiteralExpression
              && init.getChildren().length === 3 /* [ X ] */
            ) {
              existing.remove();
            } else {
              // has a correct scalar type already → skip
              continue;
            }
          }

          // now inject our correct shape:
          //  type: () => Xxx or Number/String/Boolean
          obj.addPropertyAssignment({
            name: "type",
            initializer: `() => ${typeIdentifier}`,
          });

          // array if either declared or originally array-literal
          if (declaredIsArray || !!existing) {
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