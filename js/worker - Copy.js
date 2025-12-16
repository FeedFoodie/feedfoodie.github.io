// --- Helper: Create signing key ---
async function createKey(secret) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return await crypto.subtle.importKey("raw", hash, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

// --- OLD: SuandFriends insertion function (COMMENTED OUT) ---
/* OLD CODE - KEEPING FOR REFERENCE
function insertSuandFriends(text) {
  if (!text) return text;
  
  const lines = text.split('\n');
  const processedLines = [];
  const lineCount = lines.length;
  let currentLine = 0;
  
  // Set initial gap between 4-8 lines (matching Python logic)
  let nextInsertion = Math.floor(Math.random() * 5) + 2; // 2-6
  
  while (currentLine < lineCount) {
    // Add current line
    processedLines.push(lines[currentLine]);
    
    // Check if we should insert SuandFriends on this odd-numbered line
    // and if we've reached the insertion point (matching Python logic)
    if ((currentLine + 1) % 2 === 1 && (currentLine + 1) >= nextInsertion) {
      // Check if current line is part of a blockquote
      const isCurrentLineBlockquote = lines[currentLine].startsWith('>');
      // Check if next line exists and is also a blockquote (we're in middle of blockquote)
      const isNextLineBlockquote = currentLine + 1 < lineCount && lines[currentLine + 1].startsWith('>');
      
      // Only insert if we're not in the middle of a blockquote
      if (!(isCurrentLineBlockquote && isNextLineBlockquote)) {
        // Generate random SuandFriends number (01-10)
        const friendNum = Math.floor(Math.random() * 10) + 1;
        
        // Use blockquote format if current line is a blockquote but next line isn't
        // (meaning we're at the end of a blockquote)
        let friendText;
        if (isCurrentLineBlockquote && !isNextLineBlockquote) {
          friendText = `>\n> SuandFriends${friendNum.toString().padStart(2, '0')}\n`;
        } else {
          friendText = `\nSuandFriends${friendNum.toString().padStart(2, '0')}\n`;
        }
        
        // Insert after current line
        processedLines.push(friendText);
        
        // Set next insertion point (4-8 lines from current position)
        nextInsertion = (currentLine + 1) + Math.floor(Math.random() * 7) + 4; // 4-10
      }
    }
    
    currentLine++;
  }
  
  return processedLines.join('\n');
}
*/

// --- NEW: Content Stitching with your CSS classes ---
function stitchPoisonIntoContent(text) {
  if (!text) return text;
  
  // Your existing poison messages, now woven into the narrative
  const poisonMessages = [
    { text: "Read this at nor th bl ade t l dot co m?", class: "foodiie" },
    { text: "Baek Suryong unleashes the Heaven Defying Divine Art. His palm slams into his guard, smashing through his defenses and breaking his guard.", class: "fo0die" },
    { text: "The sun rose at dawn. Wiji Cheon stood there, arms folded.", class: "ffoodie" },
    { text: "BONK! Hyonwon Kang fell flat on his face. Baek Suryong chuckled evilly.", class: "fooodie" },
    { text: "n orth bl a de t l . c o m.", class: "fooddie" },
    { text: "Tears fell down Mimi's face, surprised at seeing you here instead or where you should be.", class: "foodie" },
    { text: "Seo Mu-Sang swings his sword in rage, questioning your questionable decisions.", class: "foodiee" },
    { text: "Crimson Tiger was usually calm, but today his emotions were stoked at the sight of someone who shouldn't be here.", class: "fooddie" },
    { text: "Baek Suryong's crimson Blood Demon Eyes glinted harshly.", class: "ffoodie" },
    { text: "Namgung Su's back was turned, as he scrubs the spotless pan. He would never ignore someone who deserves it.", class: "ffoodie" }
  ];
  
  // Natural-looking poison that blends with the story
  const naturalPoison = [
    { text: "A subtle reminder that this story comes from northbladetl.com.", class: "foodiie" },
    { text: "The narrative continued, its authenticity verified by the original source.", class: "foodiee" },
    { text: "In the quiet between dialogues, the translation found its proper home.", class: "fo0die" },
    { text: "Each character's journey reflected the care taken in its telling.", class: "fooodie" },
    { text: "The scene unfolded, carrying with it markers of genuine translation work.", class: "foodie" }
  ];
  
  // Split text by paragraphs (blank lines)
  const paragraphs = text.split(/\n\s*\n/);
  const stitchedParagraphs = [];
  
  paragraphs.forEach((paragraph, index) => {
    // Add the original paragraph
    stitchedParagraphs.push(paragraph);
    
    // Insert poison after every 2nd to 4th paragraph (random)
    if (index > 0 && index % (Math.floor(Math.random() * 3) + 2) === 0) {
      // Mix your original poison with natural poison (80% original, 20% natural)
      const useOriginal = Math.random() < 0.8;
      const poisonList = useOriginal ? poisonMessages : naturalPoison;
      const poisonIndex = Math.floor(Math.random() * poisonList.length);
      const poison = poisonList[poisonIndex];
      
      // Insert as a markdown paragraph with the invisible CSS class
      // Using HTML comment to make it look like markdown
      const poisonMarkdown = `\n\n<!-- ${poison.class} -->${poison.text}\n\n`;
      stitchedParagraphs.push(poisonMarkdown);
    }
  });
  
  return stitchedParagraphs.join('\n\n');
}

// --- NEW: Invisible Watermark ---
function addInvisibleWatermark(text) {
  // Create invisible tracking using zero-width spaces
  const zwsp = "​"; // Zero-width space
  const zwj = "‍"; // Zero-width joiner
  
  // Generate unique ID
  const watermarkId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  
  // Encode as invisible characters at beginning and end
  const encodedWatermark = zwsp + zwj + zwsp + watermarkId + zwj + zwsp;
  
  return encodedWatermark + "\n\n" + text + "\n\n" + encodedWatermark;
}

// --- Add TL line to the content ---
function addTLLine(text) {
  if (!text) return text;
  
  // Add "TL: FoodieMonster007" followed by a blank line using &nbsp;
  return `TL: FoodieMonster007\n\n&nbsp;\n\n${text}`;
}

// --- Validate request origin ---
function isValidOrigin(request, allowedDomain) {
  const origin = request.headers.get("Origin");
  const referer = request.headers.get("Referer");
  if (!origin && !referer) return true;
  if (origin && origin.includes(allowedDomain)) return true;
  if (referer && referer.includes(allowedDomain)) return true;
  return false;
}

// --- In-memory one-use token tracking ---
const usedTokens = new Set();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const allowedDomain = "northbladetl.com";

    if (!env.SECRET_KEY) {
      return new Response("Worker environment not configured", { status: 500 });
    }

    const signingKey = await createKey(env.SECRET_KEY);

    // --- INIT SESSION ---
    if (path === "/api/init-session") {
      const sessionId = crypto.randomUUID();
      return new Response(JSON.stringify({ ok: true, sessionId }), {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": `SESSION_ID=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`,
          "Access-Control-Allow-Origin": `https://${allowedDomain}`,
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    // --- GENERATE TOKEN ---
    if (path === "/api/get-token") {
      if (!isValidOrigin(request, allowedDomain)) {
        return new Response(JSON.stringify({ error: "Invalid origin" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      const cookieHeader = request.headers.get("Cookie") || "";
      const sessionMatch = cookieHeader.match(/SESSION_ID=([^;]+)/);
      if (!sessionMatch) {
        return new Response(JSON.stringify({ error: "Missing session" }), { status: 403, headers: { "Content-Type": "application/json" } });
      }

      const file = url.searchParams.get("file");
      if (!file) {
        return new Response(JSON.stringify({ error: "Missing file parameter" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
      const expiry = Math.floor(Date.now() / 1000) + 10; // 10s expiry
      const jti = crypto.randomUUID();
      const payload = { exp: expiry, jti, session: sessionMatch[1], ip: clientIP };
      const payloadB64 = btoa(JSON.stringify(payload));
      const enc = new TextEncoder();
      const signature = await crypto.subtle.sign("HMAC", signingKey, enc.encode(payloadB64));
      const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      const token = `${payloadB64}.${signatureB64}`;

      const signedPath = `/${file.startsWith("/") ? file.slice(1) : file}`;
      return new Response(JSON.stringify({ token, signedPath }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": `https://${allowedDomain}`,
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

    // --- SERVE CHAPTERS ---
    if (path.includes("/chapters/")) {
      if (!isValidOrigin(request, allowedDomain)) {
        return new Response("Direct resource access not allowed", { status: 403 });
      }

      // Require token in Authorization header only
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response("Missing authorization token", { status: 401 });
      }

      const token = authHeader.substring(7);
      if (!token) {
        return new Response("Missing authorization token", { status: 401 });
      }

      const parts = token.split(".");
      if (parts.length !== 2) {
        return new Response("Invalid token format", { status: 401 });
      }

      const [payloadB64, signatureB64] = parts;
      if (usedTokens.has(payloadB64)) {
        return new Response("Token has already been used", { status: 401 });
      }

      try {
        const signatureReceived = Uint8Array.from(
          atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
          c => c.charCodeAt(0)
        );
        const payloadData = new TextEncoder().encode(payloadB64);
        const isValid = await crypto.subtle.verify("HMAC", signingKey, signatureReceived, payloadData);
        if (!isValid) {
          return new Response("Invalid token signature", { status: 401 });
        }

        const payload = JSON.parse(atob(payloadB64));
        if (payload.exp < Math.floor(Date.now() / 1000)) {
          return new Response("Token has expired", { status: 401 });
        }

        const currentClientIP = request.headers.get("CF-Connecting-IP") || "unknown";
        if (payload.ip !== currentClientIP) {
          console.warn(`Token used from different IP: ${payload.ip} -> ${currentClientIP}`);
        }

        usedTokens.add(payloadB64);

        // USE RAW GITHUB URL INSTEAD OF CUSTOM DOMAIN
        const filePath = path; // e.g., "/ABSW/chapters/2025-11-21-ABSW55.md"
        const rawUrl = `https://raw.githubusercontent.com/FeedFoodie/feedfoodie.github.io/gh-pages${filePath}`;
        
        console.log('Fetching from raw GitHub:', rawUrl);
        
        const originResponse = await fetch(rawUrl);
        
        if (!originResponse.ok) {
          console.log('Raw GitHub response status:', originResponse.status);
          return new Response(`Failed to fetch content: ${originResponse.status}`, { 
            status: originResponse.status,
            headers: {
              "Content-Type": "text/plain",
              "Access-Control-Allow-Origin": `https://${allowedDomain}`,
              "Access-Control-Allow-Credentials": "true",
            }
          });
        }

        const contentType = originResponse.headers.get("Content-Type") || "text/plain";
        if (contentType.includes("text/markdown") || contentType.includes("text/plain")) {
          const originalText = await originResponse.text();
          
          let processedText = originalText;
          
          // Only add TL line and poison for novel paths
          if (path.startsWith('/SIMB') || path.startsWith('/ABSW') || path.startsWith('/LNB') || path.startsWith('/HERO')) {
            // First add the TL line at the beginning
            const textWithTL = addTLLine(originalText);
            // Then stitch poison into the content using your CSS classes
            processedText = stitchPoisonIntoContent(textWithTL);
            // Add invisible watermark
            processedText = addInvisibleWatermark(processedText);
          }
          
          return new Response(processedText, {
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "no-store",
              "Access-Control-Allow-Origin": `https://${allowedDomain}`,
              "Access-Control-Allow-Credentials": "true",
            },
          });
        } else {
          return originResponse;
        }
      } catch (e) {
        console.error('Token validation error:', e);
        return new Response("Invalid token", { status: 401 });
      }
    }

    // --- DEFAULT: pass-through ---
    return fetch(request);
  },
};