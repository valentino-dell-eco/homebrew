// convert-index.js - Versione avanzata per OBR Suite (stile 5etools)
const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const SEARCH_DIR = path.join(ROOT_DIR, 'search');
const INDEX_PATH = path.join(SEARCH_DIR, 'index.json');

console.log('🚀 Generazione indice avanzato in stile 5etools...');

// Struttura finale
const newIndex = {
  x: [],
  m: {
    s: {}   // source map
  }
};

let idCounter = 0;
const sourceMap = {};

// Category map (già aggiornato da te)
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

function processFile(filePath, category) {
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let name = content.name || content.title || path.basename(filePath, '.json');

    if (Array.isArray(content)) {
      content.forEach(item => {
        if (item.name) addEntry(item.name, filePath, category);
      });
      return;
    }

    if (name) {
      addEntry(name, filePath, category);
    }
  } catch (e) {
    console.warn(`⚠️ Errore lettura ${filePath}: ${e.message}`);
  }
}

function addEntry(displayName, filePath, category) {
  const relPath = filePath.replace(ROOT_DIR + path.sep, '').replace(/\\/g, '/');
  
  const sourceCode = getSourceCode(displayName);
  if (!sourceMap[sourceCode]) {
    sourceMap[sourceCode] = Object.keys(sourceMap).length;
  }

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

// Cartelle da scansionare — ESPANSE con tutte le categorie del tuo categoryMap
const foldersToScan = [
  'class', 'creature', 'monster', 'spell', 'background', 'item', 'items',
  'condition', 'conditions', 'feat', 'optionalfeature', 'psionic', 'race',
  'reward', 'rewards', 'variantrule', 'variantrules', 'deity', 'deities',
  'vehicle', 'vehicles', 'trap', 'traps', 'hazard', 'hazards', 'cult',
  'boon', 'disease', 'diseases', 'table', 'tables', 'language', 'languages',
  'action', 'actions', 'recipe', 'recipes', 'deck', 'decks',
  'classFeature', 'classFeatures', 'subclass', 'subclassFeature', 'subclassFeatures',
  'data'   // mantiene compatibilità con struttura annidata
];

foldersToScan.forEach(folder => {
  const fullFolder = path.join(ROOT_DIR, folder);
  if (!fs.existsSync(fullFolder)) return;

  console.log(`📁 Scanning ${folder}...`);

  const files = fs.readdirSync(fullFolder).filter(f => f.endsWith('.json'));
  
  files.forEach(file => {
    const filePath = path.join(fullFolder, file);
    processFile(filePath, folder);
  });
});

// Finalizza e salva
newIndex.m.s = sourceMap;

fs.writeFileSync(INDEX_PATH, JSON.stringify(newIndex, null, 2));

console.log(`✅ Indice generato con successo!`);
console.log(`   📊 Totale voci: ${newIndex.x.length}`);
console.log(`   🔖 Fonti rilevate:`, Object.keys(sourceMap));
