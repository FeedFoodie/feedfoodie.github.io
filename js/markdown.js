// ================================
// markdown.js
// ================================

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

async function processMarkdownContent(containerId, authToken, signedPath) {
    const container = document.getElementById(containerId);
    if(!container) return;

    try {
        let response;
        const maxRetries = 3;
        const retryDelay = 500;

        for(let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                response = await fetch(signedPath, {
                    headers: { 'Authorization': `Bearer ${authToken}` },
                    credentials: 'include'
                });
                if(response.ok) break;
                if( (response.status !== 401 && response.status !== 503) || !(attempt < maxRetries - 1) ) {
                    throw new Error(`Failed to load chapter: ${response.status} ${response.statusText}`);
                }
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } catch(err) {
                if(!(attempt < maxRetries - 1)) throw err;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }

        if(!response || !response.ok) {
            throw new Error('Failed to load chapter after multiple retries.');
        }

        // Expect JSON response now, not plain text
        const data = await response.json();

        // --- MODIFICATION START: Handle new chunked format ---
        if(data.format === "chunked") {
            // 1. Immediately render the first half HTML
            container.innerHTML = data.firstHalf;

            // Apply site-wide settings if functions exist
            if(typeof setFontSize === 'function' && localStorage.getItem('fontSize')) {
                setFontSize(localStorage.getItem('fontSize'));
            }
            if(typeof setMode === 'function' && localStorage.getItem('colorScheme')) {
                setMode(localStorage.getItem('colorScheme'));
            }

            // 2. If there's a second half, set up scroll listener to load it
            if(data.hasSecondHalf && data.chunkToken) {
                const loadSecondHalf = async () => {
                    try {
                        const chunkResponse = await fetch('/api/get-chunk', {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${data.chunkToken}`,
                                'Content-Type': 'application/json'
                            },
                            credentials: 'include'
                        });

                        if(!chunkResponse.ok) throw new Error('Failed to load second half');

                        const chunkData = await chunkResponse.json();
                        let secondHalfHtml = chunkData.chunkText;

                        // Apply text correction to the second half
                        secondHalfHtml = applyTextCorrection(secondHalfHtml);

                        // Apply markdown parsing if available
                        if(typeof marked !== 'undefined') {
                            marked.use(markedFootnote({description: "<hr><h3>Footnotes:</h3>"}));
                            let parsed = marked.parse(
                                secondHalfHtml
                                    .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep" style="margin-bottom: 15px;">')
                                    .replace(/@\[/g, '<span class="night-mode-quotes">')
                                    .replace(/\]@/g, "</span>")
                            );
                            parsed = parsed
                                .replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
                                .replace(/♄monster[a-q]♄(.*?)♆/g, '$1')
                                .replace(/♄(monster|moonster|monsster|monstter|monsteer|monsterr|monstterr)♄(.*?)♆/g, '<span class="$1">$2</span>')
                                .replace(/☆(f0odie|foodie|ffoodie|fooddie|fo0die|foodiie|foodiee)☆(.*?)★/gs, '<p class="$1">$2</p>')
                                .replace(/<p>/g, '<p class="fooodie">');
                            secondHalfHtml = parsed;
                        } else {
                            secondHalfHtml = `<pre>${secondHalfHtml}</pre>`;
                        }

                        // Append the second half to the container
                        container.insertAdjacentHTML('beforeend', secondHalfHtml);

                        // Re-apply site-wide settings to the new content
                        if(typeof setFontSize === 'function' && localStorage.getItem('fontSize')) {
                            setFontSize(localStorage.getItem('fontSize'));
                        }
                        if(typeof setMode === 'function' && localStorage.getItem('colorScheme')) {
                            setMode(localStorage.getItem('colorScheme'));
                        }

                    } catch(error) {
                        console.error('Error loading second half:', error);
                        // Optionally show a retry button or error message
                        container.insertAdjacentHTML('beforeend',
                            '<p style="color: orange; text-align: center;">Could not load the rest of the chapter. Please refresh the page.</p>'
                        );
                    }
                };

                // Trigger loading on first scroll event
                window.addEventListener('scroll', loadSecondHalf, { once: true });
            }
        } else {
            // Fallback: if the response isn't chunked, treat it as plain text (old behavior)
            throw new Error('Unexpected response format');
        }
        // --- MODIFICATION END ---

    } catch(error) {
        const container = document.getElementById(containerId);
        if(container) {
            container.innerHTML = '<p style="color: red;">Failed to load chapter content. Authorization may have failed.</p>';
        }
        console.error('Markdown processing error:', error);
    }
}

// This event listener remains the same - it's triggered by noscript.js
window.addEventListener('ContentReady', function(event) {
    const { containerId, token, signedPath } = event.detail;
    processMarkdownContent(containerId, token, signedPath);
});