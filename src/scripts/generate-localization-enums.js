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

// Helper to decide how to generate enum property names for keys in per‑file enums
const toEnumProperty = (str) => {
  // If the key is already in all uppercase and contains underscores, keep it unchanged.
  if (str === str.toUpperCase() && str.includes('_')) {
    return str;
  }
  return toPascalCase(str);
};

// Helper to convert a string to camelCase (used for LocalizationKey enum)
const toCamelCase = (str) => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

// Get all JSON files in the input directory
const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.json'));

// Array to collect base file names for the LocalizationKey enum
const fileNames = [];

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

  // Store the base file name (e.g. "auth", "business-error", etc.)
  const baseName = path.basename(file, '.json');
  fileNames.push(baseName);

  // Generate an enum name based on the file name (e.g., auth.json => AuthKeys)
  const enumName = `${toPascalCase(baseName)}Keys`;

  // Generate enum entries: convert each key to proper enum property
  const enumEntries = keys
    .map(key => `  ${toEnumProperty(key)} = '${key}'`)
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

// Generate the LocalizationKey enum using file names
// The key is generated as camelCase, while the value remains the original file name.
const localizationEnumEntries = fileNames
  .map(name => `  ${toCamelCase(name)} = '${name}'`)
  .join(',\n');

const localizationEnumContent = `// This file is auto-generated. Do not edit manually.
export enum LocalizationKey {
${localizationEnumEntries}
}
`;

// Write the LocalizationKey enum file
const localizationEnumPath = path.join(outputDir, 'localization-key.enum.ts');
fs.writeFileSync(localizationEnumPath, localizationEnumContent, 'utf8');
console.log(`LocalizationKey enum generated with ${fileNames.length} entries at ${localizationEnumPath}`);