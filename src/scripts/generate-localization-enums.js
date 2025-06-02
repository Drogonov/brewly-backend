const fs = require('fs');
const path = require('path');

// Input directory with your localization JSON files (English)
const inputDir = path.join(__dirname, '..', 'i18n', 'en');
// Base i18n directory to look for languages (e.g. "en", "ru", etc.)
const i18nDir = path.join(__dirname, '..', 'i18n');
// Output directory for the generated enums
const outputDir = path.join(__dirname, '..', 'app.common', 'localization', 'generated');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper to convert a string to PascalCase
const toPascalCase = (str) =>
  str.replace(/(^\w|[-_]\w)/g, (match) => match.replace(/[-_]/, '').toUpperCase());

// Helper to decide how to generate enum property names for keys in per‑file enums
const toEnumProperty = (str) => {
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

// Arrays to collect file names and generated enum file names
const fileNames = [];
const generatedEnumFiles = [];

files.forEach(file => {
  const filePath = path.join(inputDir, file);
  let jsonData;
  try {
    jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return;
  }

  const keys = Object.keys(jsonData);
  const baseName = path.basename(file, '.json');
  fileNames.push(baseName);

  const enumName = `${toPascalCase(baseName)}Keys`;
  const enumEntries = keys
    .map(key => `  ${toEnumProperty(key)} = '${key}'`)
    .join(',\n');

  const enumContent = `// This file is auto-generated. Do not edit manually.
export enum ${enumName} {
${enumEntries}
}
`;
  const outputFilePath = path.join(outputDir, `${baseName}.enum.ts`);
  fs.writeFileSync(outputFilePath, enumContent, 'utf8');
  generatedEnumFiles.push(`${baseName}.enum`);
});

// Generate the LocalizationKey enum using file names
const localizationEnumEntries = fileNames
  .map(name => `  ${toCamelCase(name)} = '${name}'`)
  .join(',\n');

const localizationEnumContent = `// This file is auto-generated. Do not edit manually.
export enum LocalizationKey {
${localizationEnumEntries}
}
`;
const localizationEnumPath = path.join(outputDir, 'localization-key.enum.ts');
fs.writeFileSync(localizationEnumPath, localizationEnumContent, 'utf8');
generatedEnumFiles.push('localization-key.enum');

// Generate the Languages enum from directories in i18n folder
const languages = fs.readdirSync(i18nDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name)
  .sort(); // Optional: sort the languages alphabetically

const languagesEnumEntries = languages
  .map(lang => `  ${lang} = '${lang}'`)
  .join(',\n');

const languagesEnumContent = `// This file is auto-generated. Do not edit manually.
export enum Languages {
${languagesEnumEntries}
}
`;
const languagesEnumPath = path.join(outputDir, 'languages.enum.ts');
fs.writeFileSync(languagesEnumPath, languagesEnumContent, 'utf8');
generatedEnumFiles.push('languages.enum');

// Generate the index.ts file re-exporting all generated enums
const indexContent = generatedEnumFiles
  .map(file => `export * from './${file}';`)
  .join('\n') + '\n';

const indexFilePath = path.join(outputDir, 'index.ts');
fs.writeFileSync(indexFilePath, indexContent, 'utf8');