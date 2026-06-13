// functions/api/search-index.js
export async function onRequest(context) {
    // 1. Definisce la struttura base che il plugin si aspetta
    const indexData = { x: [] };
    let itemId = 0;

    // 2. Definisce una funzione per scansionare ricorsivamente le cartelle
    async function walkDir(dirPath, prefix) {
        const entries = await context.env.ASSETS.list({ prefix: dirPath });
        for (const entry of entries) {
            if (entry.key.endsWith('.json') && !entry.key.includes('index.json')) {
                // Costruisce il nome e il percorso per ogni file JSON trovato
                const fullPath = entry.key;
                // Crea un nome "leggibile" dal percorso del file
                const readableName = fullPath
                    .replace('data/', '')
                    .replace('.json', '')
                    .replace(/\//g, '; ');
                
                indexData.x.push({
                    id: itemId++,
                    n: readableName,
                    p: fullPath
                });
            }
        }
    }

    // 3. Scansiona le cartelle principali dove risiedono i tuoi dati homebrew
    await walkDir('data/class/', 'class');
    await walkDir('data/subclass/', 'subclass');
    await walkDir('data/race/', 'race');
    await walkDir('data/feat/', 'feat');
    await walkDir('data/spell/', 'spell');
    await walkDir('data/creature/', 'creature');
    await walkDir('data/optionalfeature/', 'optionalfeature');

    // 4. Restituisce il JSON come risposta della API
    return new Response(JSON.stringify(indexData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
