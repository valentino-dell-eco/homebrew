// functions/api/search-index.js
export async function onRequest(context) {
    const indexData = { x: [] };
    let itemId = 0;
    const host = context.request.headers.get('host');

    // Funzione che esamina una directory e trova tutti i file .json
    async function scanDirectory(dirPath) {
        try {
            // Richiede l'HTML della directory (es. https://.../data/class/)
            const url = `https://${host}/${dirPath}`;
            const response = await fetch(url);
            if (!response.ok) return;

            const html = await response.text();
            // Cerca tutti i link che finiscono con .json
            const regex = /href="([^"]+\.json)"/g;
            let match;
            while ((match = regex.exec(html)) !== null) {
                const fileName = match[1];
                const fullPath = `${dirPath}${fileName}`;
                // Nome leggibile: toglie 'data/' e sostituisce / con ; 
                const readableName = fullPath
                    .replace('data/', '')
                    .replace(/\.json$/, '')
                    .replace(/\//g, '; ');

                indexData.x.push({
                    id: itemId++,
                    n: readableName,
                    p: fullPath
                });
            }
        } catch (err) {
            console.error(`Errore nello scan di ${dirPath}:`, err);
        }
    }

    // Scansiona tutte le cartelle che contengono i tuoi JSON
    await scanDirectory('data/class/');
    await scanDirectory('data/subclass/');
    await scanDirectory('data/race/');
    await scanDirectory('data/feat/');
    await scanDirectory('data/spell/');
    await scanDirectory('data/creature/');
    await scanDirectory('data/optionalfeature/');

    return new Response(JSON.stringify(indexData, null, 2), {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
