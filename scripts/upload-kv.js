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
            const content = fs.readFileSync(cacheFile, 'utf8').trim();
            if (content === '') {
                console.log('ℹ️ Cache file is empty, initializing fresh cache.');
                return {};
            }
            return JSON.parse(content);
        } else {
            console.log('ℹ️ No cache file found, starting fresh.');
            return {};
        }
    } catch (error) {
        console.warn('⚠️ Could not load cache file, starting fresh:', error.message);
        return {};
    }
}

function saveCache(cache) {
    try {
        const cacheDir = path.dirname(cacheFile);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
        }
        fs.writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
        console.log('💾 Cache saved successfully.');
    } catch (error) {
        console.error('❌ Failed to save cache:', error.message);
    }
}

function hashContent(content) {
    return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

// NEW FUNCTION: Check KV access and list existing keys
async function checkKVAccess() {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespace}/keys`;
    
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: { 
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!res.ok) {
            const text = await res.text();
            console.error(`❌ KV access check failed: Status ${res.status}, Response: ${text}`);
            return false;
        }
        
        const data = await res.json();
        console.log(`✅ KV access verified. Found ${data.result.length} keys in namespace.`);
        return true;
    } catch (err) {
        console.error('❌ KV access check exception:', err.message);
        return false;
    }
}

// NEW FUNCTION: Sync cache with existing KV content
async function syncCacheWithKV(cache) {
    console.log('🔄 Syncing cache with existing KV content...');
    
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespace}/keys`;
    
    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: { 
                "Authorization": `Bearer ${apiToken}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!res.ok) {
            const text = await res.text();
            console.error(`❌ Failed to list KV keys: Status ${res.status}, Response: ${text}`);
            return cache; // Return original cache if we can't list keys
        }
        
        const data = await res.json();
        const keys = data.result;
        
        console.log(`📋 Found ${keys.length} keys in KV namespace`);
        
        let syncedCount = 0;
        let errorCount = 0;
        
        // Process keys in batches to avoid rate limiting
        const batchSize = 10;
        for (let i = 0; i < keys.length; i += batchSize) {
            const batch = keys.slice(i, i + batchSize);
            const batchPromises = batch.map(async (keyInfo) => {
                const key = keyInfo.name;
                
                // Only process keys that match our expected pattern
                const match = key.match(/^([A-Z]+)-(\d+)$/);
                if (!match) {
                    return; // Skip keys that don't match our pattern
                }
                
                const folder = match[1];
                const chapterNumber = match[2];
                
                // Skip if we already have this key in cache
                if (cache[key]) {
                    return;
                }
                
                // Fetch the actual value to hash it
                try {
                    const valueUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvNamespace}/values/${encodeURIComponent(key)}`;
                    const valueRes = await fetch(valueUrl, {
                        headers: { "Authorization": `Bearer ${apiToken}` }
                    });
                    
                    if (valueRes.ok) {
                        const content = await valueRes.text();
                        const hash = hashContent(content);
                        cache[key] = hash;
                        syncedCount++;
                        console.log(`✅ Synced existing KV key: ${key}`);
                    } else {
                        errorCount++;
                        console.warn(`⚠️ Could not fetch value for key: ${key}`);
                    }
                } catch (err) {
                    errorCount++;
                    console.warn(`⚠️ Error fetching value for key ${key}:`, err.message);
                }
            });
            
            await Promise.all(batchPromises);
            
            // Small delay between batches to avoid rate limiting
            if (i + batchSize < keys.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log(`🔄 Cache sync complete: ${syncedCount} keys synced, ${errorCount} errors`);
        return cache;
        
    } catch (err) {
        console.error('❌ Cache sync failed:', err.message);
        return cache; // Return original cache if sync fails
    }
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

async function uploadFolder(folder, cache) {
    const dir = findChaptersDir(folder);
    
    if (!dir) {
        console.log(`⚠️ Chapters folder not found for: ${folder}`);
        return { uploaded: 0, skipped: 0, errors: 0 };
    }

    console.log(`📁 Processing folder: ${folder} (${dir})`);
    
    let files;
    try {
        files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.html'));
    } catch (error) {
        console.error(`❌ Error reading directory ${dir}:`, error.message);
        return { uploaded: 0, skipped: 0, errors: 0 };
    }

    if (files.length === 0) {
        console.log(`ℹ️ No markdown/html files found in: ${dir}`);
        return { uploaded: 0, skipped: 0, errors: 0 };
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
    return { uploaded, skipped, errors };
}

async function main() {
    console.log('🚀 Starting KV upload process...');
    
    // Step 1: Load existing cache
    const cache = loadCache();
    console.log(`📋 Loaded ${Object.keys(cache).length} cached entries`);
    
    // Step 2: Check KV access
    console.log('🔍 Checking KV access...');
    const hasAccess = await checkKVAccess();
    if (!hasAccess) {
        console.error('❌ Cannot access KV namespace. Please check credentials.');
        process.exit(1);
    }
    
    // Step 3: Sync cache with existing KV content
    console.log('🔄 Syncing cache with existing KV data...');
    const syncedCache = await syncCacheWithKV(cache);
    console.log(`📊 Cache now contains ${Object.keys(syncedCache).length} entries`);
    
    // Step 4: Save the synced cache immediately
    saveCache(syncedCache);
    
    // Step 5: Process folders with synced cache
    let totalUploaded = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    
    for (const folder of folders) {
        const result = await uploadFolder(folder, syncedCache);
        totalUploaded += result.uploaded;
        totalSkipped += result.skipped;
        totalErrors += result.errors;
    }

    // Step 6: Save final cache
    saveCache(syncedCache);
    
    console.log(`✅ KV upload complete! Total: ${totalUploaded} uploaded, ${totalSkipped} skipped, ${totalErrors} errors`);
    console.log(`💾 Final cache contains ${Object.keys(syncedCache).length} entries`);
}

main().catch(err => {
    console.error("❌ Upload failed:", err);
    process.exit(1);
});