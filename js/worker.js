// --- Helper: Create signing key ---
async function createKey(secret) {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(secret));
  return await crypto.subtle.importKey("raw", hash, { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

// --- Helper: Split text into sentences ---
function splitIntoSentences(text) {
  const sentences = [];
  let current = '';
  let inQuote = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    current += char;
    
    if (char === '"' || char === "'") {
      inQuote = !inQuote;
      continue;
    }
    
    if (!inQuote && (char === '.' || char === '!' || char === '?')) {
      const lastWord = current.trim().split(/\s+/).pop().toLowerCase();
      const isAbbreviation = lastWord.endsWith('mr.') || 
                            lastWord.endsWith('ms.') || 
                            lastWord.includes('e.g.') ||
                            lastWord.includes('i.e.');
      
      const nextChar = i + 1 < text.length ? text[i + 1] : '';
      const nextIsCapital = nextChar && nextChar === nextChar.toUpperCase() && nextChar !== ' ';
      
      const isLookAheadException = nextChar === '*' || 
                           nextChar === '_' || 
                           nextChar === '~' ||
                           nextChar === '^' ||
                           nextChar === ']' ||
                           nextChar === '\"' ||
                           nextChar === '\'';
      
      if (!isAbbreviation && !isLookAheadException && (nextIsCapital || nextChar === ' ' || nextChar === '\n')) {
        sentences.push(current.trim());
        current = '';
      }
    }
  }
  
  if (current.trim()) {
    sentences.push(current.trim());
  }
  
  return sentences.filter(s => s.length > 10 && s.length < 500);
}

// --- Story-based poison messages ---
function getStoryBasedPoison() {
  const storyPoison = [
    { text: "Baek Suryong's eyes narrowed as he assessed the situation.", class: "f0odie" },
    { text: "Hyonwon Kang stumbled backward, his footing unsteady.", class: "foodie" },
    { text: "Mimi's voice trembled slightly as she spoke.", class: "ffoodie" },
    { text: "The air grew heavy with unspoken tension.", class: "fooddie" },
    { text: "Wiji Cheon's stern expression didn't waver.", class: "fo0die" },
    { text: "A faint smile played on his lips.", class: "foodiie" },
    { text: "The sword gleamed under the moonlight.", class: "foodiee" },
    { text: "He took a deep breath, steadying himself.", class: "f0odie" },
    { text: "Their gazes met across the crowded room.", class: "foodie" },
    { text: "She nodded slowly, understanding dawning.", class: "ffoodie" },
    { text: "The ground shook with the impact.", class: "fooddie" },
    { text: "He wiped the sweat from his brow.", class: "fo0die" },
    { text: "A cold wind swept through the valley.", class: "foodiie" },
    { text: "Her fingers tightened around the hilt.", class: "foodiee" },
    { text: "The echo of footsteps faded into the distance.", class: "f0odie" },
  ];;
  
  return storyPoison[Math.floor(Math.random() * storyPoison.length)];
}

// --- Action-based modifications ---
function getActionModification() {
  const actions = [
    "He adjusted his stance slightly.",
    "She glanced over her shoulder.",
    "A bead of sweat rolled down his temple.",
    "The fabric of his robe rustled softly.",
    "Her breath formed little clouds in the cold air.",
    "He clenched his fists unconsciously.",
    "The scent of pine filled the air.",
    "She bit her lower lip thoughtfully.",
    "His shadow stretched long behind him.",
    "A distant bird cried out.",
    "The lantern's light flickered momentarily.",
    "She tucked a strand of hair behind her ear.",
    "He rubbed the back of his neck.",
    "The floorboards creaked underfoot.",
    "Her eyes scanned the surroundings carefully."
  ];
  
  return actions[Math.floor(Math.random() * actions.length)];
}

// --- Context-Aware Duplication ---
function createContextAwareDuplicate(currentIndex, allParagraphs, invisibleClasses, usedIndices) {
  if (!allParagraphs || allParagraphs.length < 10) return null;
  
  const minDistance = 4;
  const maxDistance = Math.min(20, allParagraphs.length - 1);
  
  const eligible = [];
  for (let i = 0; i < allParagraphs.length; i++) {
    const distance = Math.abs(i - currentIndex);
    const paragraph = allParagraphs[i];
    const trimmed = paragraph.trim();
    
    if (distance >= minDistance && 
        distance <= maxDistance && 
        !usedIndices.has(i) &&
        trimmed.length > 30 && 
        trimmed.length < 500 &&
        !trimmed.includes('TL:') &&
        !trimmed.includes('NorthBladeTL:') &&
        !trimmed.includes('SuandFriends') &&
        !trimmed.match(/^\s*[>\-\*]\s*/) &&
        trimmed !== '&nbsp;' &&
        !trimmed.includes('<!--')) {
      eligible.push({ index: i, paragraph: trimmed });
    }
  }
  
  if (eligible.length === 0) return null;
  
  const randomEligible = eligible[Math.floor(Math.random() * eligible.length)];
  const randomClass = invisibleClasses[Math.floor(Math.random() * invisibleClasses.length)];
  
  usedIndices.add(randomEligible.index);
  
  return {
    text: randomEligible.paragraph,
    class: randomClass
  };
}

// --- Sentence-Level Duplication ---
function createSentenceDuplicate(allParagraphs, invisibleClasses) {
  const allSentences = [];
  
  for (let i = 0; i < allParagraphs.length; i++) {
    const paragraph = allParagraphs[i];
    const trimmed = paragraph.trim();
    
    if (trimmed.includes('TL:') || 
        trimmed.includes('NorthBladeTL:') || 
        trimmed.includes('SuandFriends') ||
        trimmed.includes('<!--') ||
        trimmed.length < 30) {
      continue;
    }
    
    const sentences = splitIntoSentences(trimmed);
    sentences.forEach(sentence => {
      if (sentence.length > 20 && sentence.length < 300) {
        allSentences.push(sentence);
      }
    });
  }
  
  if (allSentences.length === 0) return null;
  
  const randomSentence = allSentences[Math.floor(Math.random() * allSentences.length)];
  const randomClass = invisibleClasses[Math.floor(Math.random() * invisibleClasses.length)];
  
  let finalSentence = randomSentence;
  const modificationChance = Math.random();
  
  if (modificationChance > 0.7) {
    const action = getActionModification();
    finalSentence = finalSentence.replace(/[.!?]$/, '') + '. ' + action;
  } else if (modificationChance > 0.5) {
    const words = finalSentence.split(' ');
    if (words.length > 5) {
      const duplicatePart = words.slice(0, Math.floor(words.length / 2)).join(' ');
      finalSentence = duplicatePart + ' ' + duplicatePart.toLowerCase() + ' ' + words.slice(Math.floor(words.length / 2)).join(' ');
    }
  }
  
  if (!finalSentence.match(/[.!?]$/)) {
    finalSentence += '.';
  }
  
  return {
    text: finalSentence,
    class: randomClass
  };
}

// --- FIXED: Proper paragraph insertion ---
function insertPoisonAsParagraph(poisonText, poisonClass) {
  // Ensure the poison is wrapped in proper paragraph format
  // Using markdown-style paragraphs with HTML comment for the class
  return `\n\n<!-- ${poisonClass} -->${poisonText}\n\n`;
}

// --- FIXED: Content Stitching with Story-Based Poison ---
function stitchPoisonIntoContent(text, originalParagraphs, invisibleClasses) {
  if (!text) return text;
  
  const poisonMessages = [
    { text: "Read this at nor th bl ade t l dot co m?", class: "foodie" },
    { text: "Baek Suryong unleashes the Heaven Defying Divine Art. His palm slams into his guard, smashing through his defenses and breaking his guard.", class: "ffoodie" },
    { text: "The sun rose at dawn. Wiji Cheon stood there, arms folded.", class: "fooddie" },
    { text: "BONK! Hyonwon Kang fell flat on his face. Baek Suryong chuckled evilly.", class: "fo0die" },
    { text: "n orth bl a de t l . c o m.", class: "foodiie" },
    { text: "Tears fell down Mimi's face, surprised at seeing you here instead or where you should be.", class: "foodiee" },
    { text: "Seo Mu-Sang swings his sword in rage, questioning your questionable decisions.", class: "f0odie" },
    { text: "Crimson Tiger was usually calm, but today his emotions were stoked at the sight of someone who shouldn't be here.", class: "foodie" },
    { text: "Baek Suryong's crimson Blood Demon Eyes glinted harshly.", class: "ffoodie" },
    { text: "Namgung Su's back was turned, as he scrubs the spotless pan. He would never ignore someone who deserves it.", class: "fooddie" },
  ];;
  
  // Split text by paragraphs (more robust splitting)
  const paragraphs = text.split(/\n\s*\n/);
  const stitchedParagraphs = [];
  
  // Track used paragraph indices
  const usedParagraphIndices = new Set();
  
  for (let i = 0; i < paragraphs.length; i++) {
    // Add the original paragraph with proper spacing
    const currentPara = paragraphs[i].trim();
    if (currentPara) {
      stitchedParagraphs.push(currentPara);
    }
    
    // Insert poison after every 2nd to 4th paragraph (random)
    if (i > 0 && i % (Math.floor(Math.random() * 3) + 2) === 0 && currentPara) {
      const poisonType = Math.random();
      let poisonMarkdown = '';
      
      if (poisonType < 0.3) {
        const poison = poisonMessages[Math.floor(Math.random() * poisonMessages.length)];
        poisonMarkdown = insertPoisonAsParagraph(poison.text, poison.class);
      } 
      else if (poisonType < 0.5) {
        const storyPoison = getStoryBasedPoison();
        poisonMarkdown = insertPoisonAsParagraph(storyPoison.text, storyPoison.class);
      }
      else if (poisonType < 0.7) {
        const duplicatePoison = createContextAwareDuplicate(i, originalParagraphs, invisibleClasses, usedParagraphIndices);
        if (duplicatePoison) {
          poisonMarkdown = insertPoisonAsParagraph(duplicatePoison.text, duplicatePoison.class);
        } else {
          const storyPoison = getStoryBasedPoison();
          poisonMarkdown = insertPoisonAsParagraph(storyPoison.text, storyPoison.class);
        }
      }
      else if (poisonType < 0.85) {
        const sentencePoison = createSentenceDuplicate(originalParagraphs, invisibleClasses);
        if (sentencePoison) {
          poisonMarkdown = insertPoisonAsParagraph(sentencePoison.text, sentencePoison.class);
        } else {
          const storyPoison = getStoryBasedPoison();
          poisonMarkdown = insertPoisonAsParagraph(storyPoison.text, storyPoison.class);
        }
      }
      else {
        const strategy = Math.random();
        if (strategy < 0.5) {
          const duplicatePoison = createContextAwareDuplicate(i, originalParagraphs, invisibleClasses, usedParagraphIndices);
          if (duplicatePoison) {
            const action = getActionModification();
            let modifiedText = duplicatePoison.text;
            if (!modifiedText.match(/[.!?]$/)) modifiedText += '.';
            modifiedText += ' ' + action;
            poisonMarkdown = insertPoisonAsParagraph(modifiedText, duplicatePoison.class);
          } else {
            const storyPoison = getStoryBasedPoison();
            poisonMarkdown = insertPoisonAsParagraph(storyPoison.text, storyPoison.class);
          }
        } else {
          const action = getActionModification();
          const randomClass = invisibleClasses[Math.floor(Math.random() * invisibleClasses.length)];
          poisonMarkdown = insertPoisonAsParagraph(action, randomClass);
        }
      }
      
      if (poisonMarkdown) {
        // FIX: Don't trim! This removes the paragraph separation
        stitchedParagraphs.push(poisonMarkdown);
      }
    }
  }
  
  // Join paragraphs with proper spacing
  return stitchedParagraphs.join('\n\n');
}

// --- FIXED: Invisible Watermark ---
function addInvisibleWatermark(text, invisibleClasses) {
  const watermarkId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  let watermarkClass;
  if (invisibleClasses && invisibleClasses.length >= 8) {
    watermarkClass = invisibleClasses[0];
  } else {
    watermarkClass = invisibleClasses[1];
  }
  
  const storyWatermarks = [
    `The scene unfolded, marked by identifier ${watermarkId}.`,
    `As events progressed, record ${watermarkId} was noted.`,
    `Within the narrative flow, marker ${watermarkId} was placed.`,
    `The sequence continued, bearing notation ${watermarkId}.`,
    `Amidst the action, signifier ${watermarkId} was embedded.`
  ];
  
  const randomWatermark = storyWatermarks[Math.floor(Math.random() * storyWatermarks.length)];
  // FIX: Use insertPoisonAsParagraph to ensure proper paragraph separation for watermark too
  const watermark = insertPoisonAsParagraph(randomWatermark, watermarkClass);
  
  // Add watermark at the beginning of the text
  return watermark + text;
}

// --- Add TL line ---
function addTLLine(text) {
  if (!text) return text;
  
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
      const expiry = Math.floor(Date.now() / 1000) + 10;
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

        const filePath = path;
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
          
          if (path.startsWith('/SIMB') || path.startsWith('/ABSW') || path.startsWith('/LNB') || path.startsWith('/HERO')) {
            const originalParagraphs = originalText.split(/\n\s*\n/);
            
            const invisibleClasses = [
      "f0odie",
      "foodie",
      "ffoodie",
      "fooddie",
      "fo0die",
      "foodiie",
      "foodiee"
    ];
            
            // FIX: Process in correct order: watermark -> TL -> poison
            const textWithWatermark = addInvisibleWatermark(originalText, invisibleClasses);
            const textWithTL = addTLLine(textWithWatermark);
            processedText = stitchPoisonIntoContent(textWithTL, originalParagraphs, invisibleClasses);
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

    return fetch(request);
  },
};