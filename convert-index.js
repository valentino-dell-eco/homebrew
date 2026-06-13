// convert-index.js
const fs = require('fs');
const path = require('path');

// 1. Leggi il file attuale dalla sua posizione
const inputPath = path.join(__dirname, 'search', 'index.json');
console.log(`📂 Leggo il file da: ${inputPath}`);

if (!fs.existsSync(inputPath)) {
    console.error(`❌ ERRORE: File non trovato in ${inputPath}`);
    process.exit(1);
}

const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// 2. Converti nel nuovo formato
const newData = { x: [] };
let idCounter = 0;

for (const [name, filePath] of Object.entries(inputData)) {
    newData.x.push({
        id: idCounter++,
        n: name,
        p: filePath
    });
}

console.log(`✅ Convertiti ${newData.x.length} elementi.`);

// 3. Scrivi il nuovo file sovrascrivendo quello vecchio
fs.writeFileSync(inputPath, JSON.stringify(newData, null, 2));
console.log(`🎉 Fatto! Il file è stato convertito con successo.`);
