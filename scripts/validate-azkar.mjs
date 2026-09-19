import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argPath = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const datasetPath = path.resolve(argPath ?? path.join(__dirname, '../src/dataset/azkar.json'));
const strict = process.argv.includes('--strict');

const errors = [];
const warnings = [];

function normalize(text) {
  return String(text)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

let dataset;
try {
  dataset = JSON.parse(readFileSync(datasetPath, 'utf8'));
} catch (err) {
  console.error(`FATAL: cannot read/parse ${datasetPath}: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(dataset) || dataset.length === 0) {
  console.error('ERROR: dataset must be a non-empty array');
  process.exit(1);
}

const idOwners = new Map();
const titleOwners = new Map();
const contentOwners = new Map();
let phraseCount = 0;

for (const category of dataset) {
  const id = category?.id;
  const title = category?.category;
  const array = category?.array;

  if (id == null) {
    errors.push('category with missing id');
    continue;
  }

  if (title == null || !String(title).trim()) {
    errors.push(`category id ${id}: missing title`);
    continue;
  }
  const trimmedTitle = String(title).trim();
  const idKey = String(id);
  const idList = idOwners.get(idKey) ?? [];
  idList.push(trimmedTitle);
  idOwners.set(idKey, idList);

  const titleKey = normalize(trimmedTitle);
  const titleList = titleOwners.get(titleKey) ?? [];
  titleList.push(id);
  titleOwners.set(titleKey, titleList);

  if (!Array.isArray(array) || array.length === 0) {
    errors.push(`category ${id} "${trimmedTitle}": array is missing or empty`);
    continue;
  }

  const phraseIds = new Map();
  const phraseTexts = new Map();
  const signature = [];

  for (const phrase of array) {
    if (phrase?.id == null) {
      errors.push(`category ${id} "${trimmedTitle}": phrase missing id`);
      continue;
    }
    if (phrase.text == null || !String(phrase.text).trim()) {
      errors.push(`category ${id} "${trimmedTitle}": phrase #${phrase.id} missing text`);
      continue;
    }

    const textKey = normalize(phrase.text);
    signature.push(textKey);
    phraseCount += 1;

    const idPhrases = phraseIds.get(String(phrase.id)) ?? [];
    idPhrases.push(textKey.slice(0, 60));
    phraseIds.set(String(phrase.id), idPhrases);

    const textPhrases = phraseTexts.get(textKey) ?? [];
    textPhrases.push(phrase.id);
    phraseTexts.set(textKey, textPhrases);
  }

  for (const [pid, texts] of phraseIds) {
    if (texts.length > 1) {
      errors.push(`category ${id} "${trimmedTitle}": duplicate phrase id ${pid}`);
    }
  }
  for (const [textKey, pids] of phraseTexts) {
    if (pids.length > 1) {
      errors.push(`category ${id} "${trimmedTitle}": duplicate phrase text "${textKey.slice(0, 60)}"`);
    }
  }

  const contentKey = signature.join('||');
  const owners = contentOwners.get(contentKey) ?? [];
  owners.push({ id, title: trimmedTitle });
  contentOwners.set(contentKey, owners);
}

for (const [idKey, titles] of idOwners) {
  if (titles.length > 1) {
    errors.push(`duplicate category id ${idKey}: ${titles.join(' / ')}`);
  }
}
for (const [titleKey, ids] of titleOwners) {
  if (ids.length > 1) {
    errors.push(`duplicate category title "${titleKey}" (ids: ${ids.join(', ')})`);
  }
}
for (const [contentKey, owners] of contentOwners) {
  if (owners.length > 1) {
    warnings.push(
      `categories with identical content (ids: ${owners.map((c) => c.id).join(', ')}): ` +
        owners.map((c) => `"${c.title}"`).join(' / ')
    );
  }
}

console.log(`Validated ${dataset.length} categories, ${phraseCount} phrases.`);

if (errors.length > 0) {
  console.error(`\n${errors.length} ERROR(S):`);
  errors.forEach((error) => console.error(`  - ${error}`));
}
if (warnings.length > 0) {
  console.log(`\n${warnings.length} WARNING(S):`);
  warnings.forEach((warning) => console.log(`  ! ${warning}`));
}

if (errors.length > 0 || (strict && warnings.length > 0)) {
  process.exit(1);
}
console.log('Dataset is valid: no duplicate categories or phrases.');
