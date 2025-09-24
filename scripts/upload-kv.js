// scripts/upload-kv.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const accountId = process.env.CF_ACCOUNT_ID;
const apiToken = process.env.CF_API_TOKEN;

// Map folder names to KV namespace
const folders = ["SIMB", "LNB", "ABSW", "RUH", "HERO", "LCS"];
const kvNamespace = "TOKEN_KV"; // Replace with your actual KV namespace
const cacheFile = path.join(process.cwd(), '.kv-cache.json');

// Load previous hashes
let cache = {};
if (fs.existsSync(cacheFile)) {
    try { cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8')); } 
    catch { cache = {}; }
}

function hashContent(content) {
    return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

async function putKV(key, value) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespace}/values/${encodeURIComponent(key)}`;
    const res = await fetch(url, {
        method: 'PUT',
        headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "text/plain" },
        body: value
    });
    if (!res.ok) console.log(`❌ Failed KV write: ${key}`);
    else console.log(`✅ KV write: ${key}`);
}

async function uploadFolder(folder) {
    const dir = path.join(process.cwd(), folder, 'chapters');
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.html'));
    for (const file of files) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const fileHash = hashContent(content);
        const key = `${folder}/${file}`;

        if (cache[key] === fileHash) {
            console.log(`⏭ Skipping unchanged: ${key}`);
            continue;
        }

        await putKV(key, content);
        cache[key] = fileHash;
    }
}

async function main() {
    for (const folder of folders) {
        await uploadFolder(folder);
    }

    fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
    console.log("✅ KV upload complete, cache updated!");
}

main().catch(console.error);
