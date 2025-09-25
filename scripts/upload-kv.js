// scripts/upload-kv.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accountId = process.env.CF_ACCOUNT_ID;
const apiToken = process.env.CF_API_TOKEN;
const kvNamespace = process.env.CF_KV_NAMESPACE;

if (!accountId || !apiToken || !kvNamespace) {
    console.error("❌ Missing CF_ACCOUNT_ID, CF_API_TOKEN, or CF_KV_NAMESPACE!");
    process.exit(1);
}

console.log("Account ID:", accountId);
console.log("KV Namespace:", kvNamespace);
console.log("API Token length:", apiToken.length);

const folders = ["SIMB", "LNB", "ABSW", "RUH", "HERO", "LCS"];

// Use a cache file in the scripts folder
const cacheFile = path.join(__dirname, 'kv-cache.json');

// Load previous hashes with better error handling
function loadCache() {
    try {
        if (fs.existsSync(cacheFile)) {
            const content = fs.readFileSync(cacheFile, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.warn('⚠️ Could not load cache file, starting fresh:', error.message);
    }
    return {};
}

function saveCache(cache) {
    try {
        fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
        console.log('💾 Cache saved successfully');
    } catch (error) {
        console.error('❌ Failed to save cache:', error.message);
    }
}

function hashContent(content) {
    return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

async function putKV(key, value) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespace}/values/${encodeURIComponent(key)}`;
    
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 
                "Authorization": `Bearer ${apiToken}`, 
                "Content-Type": "text/plain" 
            },
            body: value
        });
        
        const text = await res.text();
        
        if (!res.ok) {
            const errorMsg = `KV write failed: ${key} | Status: ${res.status} | Response: ${text}`;
            console.log(`❌ ${errorMsg}`);
            return false;
        } else {
            console.log(`✅ KV write successful: ${key}`);
            return true;
        }
    } catch (err) {
        const errorMsg = `KV write exception: ${key} | Error: ${err.message}`;
        console.error(`❌ ${errorMsg}`);
        return false;
    }
}

function findChaptersDir(folder) {
    // Try different possible locations
    const possiblePaths = [
        path.join(process.cwd(), '..', folder, 'chapters'),
        path.join(__dirname, '..', '..', folder, 'chapters'),
        path.join(process.cwd(), folder, 'chapters')
    ];
    
    for (const dirPath of possiblePaths) {
        if (fs.existsSync(dirPath)) {
            return dirPath;
        }
    }
    return null;
}

async function uploadFolder(folder, cache) {  // Now accepts cache as parameter
    const dir = findChaptersDir(folder);
    
    if (!dir) {
        console.log(`⚠️ Chapters folder not found for: ${folder}`);
        return;
    }

    console.log(`📁 Processing folder: ${folder} (${dir})`);
    
    let files;
    try {
        files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.html'));
    } catch (error) {
        console.error(`❌ Error reading directory ${dir}:`, error.message);
        return;
    }

    if (files.length === 0) {
        console.log(`ℹ️ No markdown/html files found in: ${dir}`);
        return;
    }

    let uploaded = 0;
    let skipped = 0;
    let errors = 0;

    for (const file of files) {
        const filePath = path.join(dir, file);
        
        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error(`❌ Error reading file ${filePath}:`, error.message);
            errors++;
            continue;
        }

        const fileHash = hashContent(content);

        // Extract key from filename
        const baseName = path.basename(file, path.extname(file));
        const match = baseName.match(/[A-Z]+(\d+)$/);
        
        if (!match) {
            console.log(`⚠️ Skipping unrecognized filename: ${file}`);
            continue;
        }

        const chapterNumber = match[1];
        const key = `${folder}-${chapterNumber}`;

        if (cache[key] === fileHash) {
            console.log(`⏭ Skipping unchanged: ${key}`);
            skipped++;
            continue;
        }

        const success = await putKV(key, content);
        
        if (success) {
            cache[key] = fileHash;
            uploaded++;
        } else {
            errors++;
        }
    }

    console.log(`📊 ${folder}: ${uploaded} uploaded, ${skipped} skipped, ${errors} errors`);
}

async function main() {
    console.log('🚀 Starting KV upload process...');
    
    // Load cache at the start
    const cache = loadCache();
    console.log(`📋 Loaded ${Object.keys(cache).length} cached entries`);

    for (const folder of folders) {
        await uploadFolder(folder, cache);  // Pass cache to each folder
    }

    // Save cache at the end
    saveCache(cache);
    
    console.log('✅ KV upload complete!');
}

main().catch(err => {
    console.error("❌ Upload failed:", err);
    process.exit(1);
});