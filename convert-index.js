// convert-index.js - Versione avanzata + generazione automatica probe files (data/)
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const SEARCH_DIR = path.join(ROOT_DIR, 'search');
const INDEX_PATH = path.join(SEARCH_DIR, 'index.json');
const DATA_DIR = path.join(ROOT_DIR, 'data');

console.log('🚀 Generazione indice + probe files per OBR Suite...');

// Pulizia completa della cartella data/ prima di iniziare
if (fs.existsSync(DATA_DIR)) {
  fs.rmSync(DATA_DIR, { recursive: true, force: true });
}
fs.mkdirSync(DATA_DIR, { recursive: true });

const newIndex = { x: [], m: { s: {} } };
let idCounter = 0;
const sourceMap = {};

// Category → cartella di destinazione in /data/
const targetFolderMap = {
  'creature': 'bestiary',
  'monster': 'bestiary',
  'spell': 'spells',
  'feat': 'feats',
  'optionalfeature': 'optionalfeatures',
  'race': 'races',
  'class': 'class',
  'subclass': 'subclass',
  'background': 'backgrounds',
  'item': 'items',
  // aggiungi altre se necessario
};


const categoryMap = {
  'monster': 1,
  'creature': 1,
  'spell': 2,
  'background': 3,
  'item': 4,
  'class': 5,
  'condition': 6,
  'feat': 7,
  'optionalfeature': 8,
  'psionic': 9,
  'race': 10,
  'reward': 11,
  'variantrule': 12,
  'deity': 14,
  'vehicle': 15,
  'trap': 16,
  'hazard': 17,
  'cult': 19,
  'boon': 20,
  'disease': 21,
  'table': 24,
  'language': 43,
  'action': 42,
  'recipe': 48,
  'deck': 52,
  'classFeature': 30,
  'subclass': 40,
  'subclassFeature': 41,
};

function getSourceCode(name) {
  const prefix = name.split(';')[0].trim();
  let code = prefix.replace(/[^A-Z0-9]/gi, '').slice(0, 6).toUpperCase();
  if (code.length < 2) code = 'HB' + (Object.keys(sourceMap).length + 1);
  return code;
}

function ensureTargetDir(folder) {
  const dir = path.join(DATA_DIR, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function processFile(filePath, category) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const sourceFiles = new Map(); // sourceCode → array di items

    const items = Array.isArray(content) ? content : [content];

    items.forEach(item => {
      if (!item.name) return;
      
      const sourceCode = getSourceCode(item.name || item.title || '');
      if (!sourceFiles.has(sourceCode)) sourceFiles.set(sourceCode, []);
      sourceFiles.get(sourceCode).push(item);
    });

    // Crea/aggiorna i file probe per ogni source
    sourceFiles.forEach((items, sourceCode) => {
      if (!sourceMap[sourceCode]) {
        sourceMap[sourceCode] = Object.keys(sourceMap).length;
      }

      const targetFolder = targetFolderMap[category] || category;
      ensureTargetDir(targetFolder);

      const targetFileName = `${category}-${sourceCode}.json`;
      const targetPath = path.join(DATA_DIR, targetFolder, targetFileName);

      const output = {};
      output[category === 'creature' || category === 'monster' ? 'monster' : category] = items;

      fs.writeFileSync(targetPath, JSON.stringify(output, null, 2));
      console.log(`   📄 Creato probe: ${targetFolder}/${targetFileName} (${items.length} items)`);

      // Aggiungi all'indice principale
      items.forEach(item => {
        addEntry(item.name || item.title, filePath, category, sourceCode);
      });
    });
  } catch (e) {
    console.warn(`⚠️ Errore ${filePath}: ${e.message}`);
  }
}

function addEntry(displayName, filePath, category, sourceCode) {
  const relPath = filePath.replace(ROOT_DIR + path.sep, '').replace(/\\/g, '/');
  
  const entry = {
    id: idCounter++,
    c: categoryMap[category] || 99,
    u: encodeURIComponent(relPath.replace(/^data\//, '')),
    p: Math.floor(Math.random() * 300) + 1,
    s: sourceMap[sourceCode],
    h: 1,
    n: displayName
  };
  newIndex.x.push(entry);
}

// ==================== SCAN ====================
const foldersToScan = ['class', 'creature', 'monster', 'spell', 'feat', 'optionalfeature', 'race', 'subclass', 'background', 'item', 'data'];

foldersToScan.forEach(folder => {
  const fullFolder = path.join(ROOT_DIR, folder);
  if (!fs.existsSync(fullFolder)) return;

  console.log(`📁 Scanning ${folder}...`);
  const files = fs.readdirSync(fullFolder).filter(f => f.endsWith('.json'));

  files.forEach(file => {
    processFile(path.join(fullFolder, file), folder);
  });
});

// Finalizza indice
newIndex.m.s = sourceMap;
fs.writeFileSync(INDEX_PATH, JSON.stringify(newIndex, null, 2));

console.log(`\n✅ COMPLETATO!`);
console.log(`   📊 Totale voci nell'indice: ${newIndex.x.length}`);
console.log(`   🔖 Fonti rilevate:`, Object.keys(sourceMap));
console.log(`   📁 Cartella data/ generata con tutti i probe necessari.`);
