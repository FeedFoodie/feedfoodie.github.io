function applyTextCorrection(e) {
    const t = {'☁':'e','☉':'t','☍':'a','☛':'o','☢':'i','☠':'n','☣':'s','☯':'r','☹':'h'};
    let n = "";
    for(let o = 0; o < e.length; o++) {
        const r = e[o];
        if(t[r]) {
            n += t[r];
        } else {
            n += r;
        }
    }
    return n;
}

async function processMarkdownContent(e, t, o) {
    const n = document.getElementById(e);
    if(!n) return;
    
    if("undefined" != typeof marked) {
        marked.use(markedFootnote({description:"<hr><h3>Footnotes:</h3>"}));
    }
    
    try {
        let r, i = 3, c = 500;
        for(let a = 0; a < i; a++) {
            try {
                r = await fetch(o, {
                    headers: {Authorization: `Bearer ${t}`},
                    credentials: "include"
                });
                
                if(r.ok) break;
                
                if((r.status === 401 || r.status === 503) && a < i - 1) {
                    await new Promise(e => setTimeout(e, c));
                    continue;
                }
                throw new Error(`Failed to load chapter: ${r.status} ${r.statusText}`);
            } catch(e) {
                if(a < i - 1) {
                    await new Promise(e => setTimeout(e, c));
                    continue;
                }
                throw e;
            }
        }
        
        if(!r || !r.ok) throw new Error("Failed to load chapter after multiple retries.");
        
        let s, contentText;
        
        // Check if response is JSON
        const contentType = r.headers.get("content-type") || "";
        if(contentType.includes("application/json")) {
            // Handle JSON response with split parts
            const jsonData = await r.json();
            contentText = jsonData.part1 + jsonData.part2;
        } else {
            // Fallback to plain text for backward compatibility
            contentText = await r.text();
        }
        
        contentText = applyTextCorrection(contentText);
        
        if("undefined" != typeof marked) {
            let e = marked.parse(contentText
                .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep" style="margin-bottom: 15px;">')
                .replace(/@\[/g, '<span class="night-mode-quotes">')
                .replace(/\]@/g, "</span>")
            );
            
            e = e.replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
                .replace(/♄monster[a-q]♄(.*?)♆/g, '$1')
                .replace(/♄(monster|moonster|monsster|monstter|monsteer|monsterr|monstterr)♄(.*?)♆/g, '<span class="$1">$2</span>')
                .replace(/☆(f0odie|foodie|ffoodie|fooddie|fo0die|foodiie|foodiee)☆(.*?)★/gs, '<p class="$1">$2</p>')
                .replace(/<p>/g, '<p class="fooodie">');
            
            s = e;
        } else {
            s = `<pre>${contentText}</pre>`;
        }
        
        n.innerHTML = s;
        
        if("function" == typeof setFontSize && localStorage.getItem("fontSize")) {
            setFontSize(localStorage.getItem("fontSize"));
        }
        
        if("function" == typeof setMode && localStorage.getItem("colorScheme")) {
            setMode(localStorage.getItem("colorScheme"));
        }
        
    } catch(e) {
        const t = document.getElementById(e);
        t && (t.innerHTML = '<p style="color: red;">Failed to load chapter content. Authorization may have failed.</p>');
        console.error("Markdown processing error:", e);
    }
}

window.addEventListener('ContentReady', function(e) {
    const {containerId: t, token: o, signedPath: n} = e.detail;
    processMarkdownContent(t, o, n);
});