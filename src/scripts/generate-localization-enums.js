const fs = require('fs');
const path = require('path');

// Input directory with your English localization JSON files
const inputDir = path.join(__dirname, '..', 'i18n', 'en');
// Output directory for the generated enums
const outputDir = path.join(__dirname, '..', 'app.common', 'localization', 'generated');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to convert a string to PascalCase
const toPascalCase = (str) =>
  str
    .replace(/(^\w|[-_]\w)/g, (match) => match.replace(/[-_]/, '').toUpperCase());

// Get all JSON files in the input directory
const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(inputDir, file);
  let jsonData;
  try {
    jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return;
  }

  // Get all keys from the JSON file
  const keys = Object.keys(jsonData);

  // Generate an enum name based on the file name (e.g., auth.json => AuthKeys)
  const baseName = path.basename(file, '.json');
  const enumName = `${toPascalCase(baseName)}Keys`;

  // Generate enum entries: convert each key to PascalCase for the enum property
  const enumEntries = keys
    .map(key => `  ${toPascalCase(key)} = '${key}'`)
    .join(',\n');

  // Compose the complete enum content
  const enumContent = `// This file is auto-generated. Do not edit manually.
export enum ${enumName} {
${enumEntries}
}
`;

  // Write the generated enum file to the output directory
  const outputFilePath = path.join(outputDir, `${baseName}.enum.ts`);
  fs.writeFileSync(outputFilePath, enumContent, 'utf8');
  console.log(`${enumName} generated with ${keys.length} keys at ${outputFilePath}`);
});