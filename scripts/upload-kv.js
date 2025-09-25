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

// Use a logfile in the scripts folder for better reliability
const logFile = path.join(__dirname, 'kv-upload.log');
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

function logToFile(message) {
    try {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(logFile, logMessage);
    } catch (error) {
        console.warn('⚠️ Could not write to log file:', error.message);
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
            logToFile(`ERROR: ${errorMsg}`);
            return false;
        } else {
            const successMsg = `KV write successful: ${key}`;
            console.log(`✅ ${successMsg}`);
            logToFile(`SUCCESS: ${successMsg}`);
            return true;
        }
    } catch (err) {
        const errorMsg = `KV write exception: ${key} | Error: ${err.message}`;
        console.error(`❌ ${errorMsg}`);
        logToFile(`EXCEPTION: ${errorMsg}`);
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

async function uploadFolder(folder) {
    const dir = findChaptersDir(folder);
    
    if (!dir) {
        console.log(`⚠️ Chapters folder not found for: ${folder}`);
        logToFile(`WARNING: Chapters folder not found for ${folder}`);
        return;
    }

    console.log(`📁 Processing folder: ${folder} (${dir})`);
    
    let files;
    try {
        files = fs.readdirSync(dir).filter(f => f.endsWith('.md') || f.endsWith('.html'));
    } catch (error) {
        console.error(`❌ Error reading directory ${dir}:`, error.message);
        logToFile(`ERROR: Could not read directory ${dir} - ${error.message}`);
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
            logToFile(`ERROR: Could not read file ${filePath} - ${error.message}`);
            errors++;
            continue;
        }

        const fileHash = hashContent(content);

        // Extract key from filename
        const baseName = path.basename(file, path.extname(file));
        const match = baseName.match(/[A-Z]+(\d+)$/);
        
        if (!match) {
            console.log(`⚠️ Skipping unrecognized filename: ${file}`);
            logToFile(`WARNING: Unrecognized filename format: ${file}`);
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
    logToFile(`SUMMARY: ${folder} - Uploaded: ${uploaded}, Skipped: ${skipped}, Errors: ${errors}`);
}

async function main() {
    console.log('🚀 Starting KV upload process...');
    logToFile('START: KV upload process started');
    
    const cache = loadCache();
    console.log(`📋 Loaded ${Object.keys(cache).length} cached entries`);

    let totalUploaded = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    for (const folder of folders) {
        const beforeCount = Object.keys(cache).length;
        await uploadFolder(folder);
        const afterCount = Object.keys(cache).length;
        totalUploaded += (afterCount - beforeCount);
    }

    saveCache(cache);
    
    const summary = `✅ KV upload complete! Total: ${totalUploaded} uploaded, ${totalSkipped} skipped, ${totalErrors} errors`;
    console.log(summary);
    logToFile(`COMPLETE: ${summary}`);
    
    // Clean up old cache entries for files that no longer exist?
    // This would prevent cache bloat over time
}

main().catch(err => {
    const errorMsg = `Upload failed: ${err.message}`;
    console.error("❌", errorMsg);
    logToFile(`FATAL: ${errorMsg}`);
    process.exit(1);
});