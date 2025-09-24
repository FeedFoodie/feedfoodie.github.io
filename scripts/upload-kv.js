// scripts/upload-kv.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';

const accountId = process.env.CF_ACCOUNT_ID;
const apiToken = process.env.CF_API_TOKEN;
const kvNamespace = process.env.CF_KV_NAMESPACE; // GitHub Actions secret

if (!accountId || !apiToken || !kvNamespace) {
    console.error("❌ Missing CF_ACCOUNT_ID, CF_API_TOKEN, or CF_KV_NAMESPACE!");
    process.exit(1);
}

console.log("Account ID:", accountId);
console.log("KV Namespace:", kvNamespace);
console.log("API Token length:", apiToken.length);

const folders = ["SIMB", "LNB", "ABSW", "RUH", "HERO", "LCS"];
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
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "text/plain" },
            body: value
        });
        const text = await res.text();
        if (!res.ok) console.log(`❌ KV write failed: ${key} | Status: ${res.status} | Response: ${text}`);
        else console.log(`✅ KV write successful: ${key}`);
    } catch (err) {
        console.error(`❌ KV write exception: ${key} | Error: ${err}`);
    }
}

async function uploadFolder(folder) {
    const dir = path.join(process.cwd(), '..', folder, 'chapters'); // adjust depending on workflow
    if (!fs.existsSync(dir)) {
        console.log(`⚠️ Folder not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.html'));
    for (const file of files) {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const fileHash = hashContent(content);

        // --- NEW KEY FORMAT ---
        const baseName = path.basename(file, path.extname(file)); // e.g., 2024-11-23-ABSW00
        const match = baseName.match(/[A-Z]+(\d+)$/); // extract digits after letters
        if (!match) {
            console.log(`⚠️ Skipping unrecognized filename: ${file}`);
            continue;
        }
        const chapterNumber = match[1]; // e.g., "00" or "001"
        const key = `${folder}-${chapterNumber}`; // ABSW-00, SIMB-001

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

main().catch(err => {
    console.error("❌ Upload failed:", err);
    process.exit(1);
});
