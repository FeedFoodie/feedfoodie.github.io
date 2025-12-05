/* eslint-disable */
async function _checkEnvProps() {
    const finderskeepers = [
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/136.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/W.X.Y.Z Mobile Safari/537.36 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
        "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
        "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots/urls)",
        "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 8_1 like Mac OS X) AppleWebKit/600.1.4 (KHTML, like Gecko) Version/8.0 Mobile/12B411 Safari/600.1.4 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
        "Mozilla/5.0 (Linux; Android 5.0.2; SM-G920F Build/LRX22G) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/37.0.0.0 Mobile Safari/537.36 (compatible; YandexBot/3.0; +http://yandex.com/bots)",
        "DuckDuckBot/1.0; (+http://duckduckgo.com/bot)",
        "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)",
        "Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)",
        "Mozilla/5.0 (compatible; Yahoo! Slurp/3.0; http://help.yahoo.com/help/us/ysearch/slurp)",
        "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; https://zhanzhang.toutiao.com/)",
        "YisouSpider"
    ];

    for (let i = 0; i < finderskeepers.length; i++) {
        if (navigator.userAgent === finderskeepers[i]) {
            return false;
        }
    }

    let detected = false;
    let detectionReason = [];

    const userAgent = navigator.userAgent;
    const isChromiumBrowser = (ua) => ua.includes("Chrome/");

    if (navigator.webdriver) {
        detected = true;
        detectionReason.push('webdriver');
    }

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const renderer = gl.getParameter(gl.RENDERER);
            if (renderer.includes('SwiftShader') || renderer.includes('Mesa')) {
                detected = true;
                detectionReason.push('webgl-renderer');
            }
        } else {
            detected = true;
            detectionReason.push('no-webgl');
        }
    } catch (e) {
        detected = true;
        detectionReason.push('webgl-error');
    }

    if (navigator.languages && Array.isArray(navigator.languages) && navigator.languages.length === 0) {
        detected = true;
        detectionReason.push('empty-languages-array');
    }

    if (window.outerWidth === 0 && window.outerHeight === 0) {
        if (isChromiumBrowser(userAgent)) {
            detectionReason.push('outer-dims-zero-chromium');
        } else {
            detected = true;
            detectionReason.push('outer-dims-zero-non-chromium');
        }
    }

    if (window.outerWidth === 800 && window.outerHeight === 600) {
        detected = true;
        detectionReason.push('outer-dims-800x600');
    }

    return detected;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function ensureSession() {
    if (!getCookie('SESSION_ID')) {
        try {
            const response = await fetch('/api/init-session', {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) throw new Error('Failed to initialize session');
            const result = await response.json();
            if (!result.ok) throw new Error('Session initialization failed');
        } catch (error) {
            throw error;
        }
    }
}

async function fetchSignedInfo(filePath) {
    try {
        const response = await fetch(`/api/get-token?file=${encodeURIComponent(filePath)}`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`Failed to fetch token: ${response.status} ${response.statusText}`);
        const result = await response.json();
        if (!result.token || !result.signedPath) throw new Error('Signed token or path missing');
        return result; // { token, signedPath }
    } catch (error) {
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const contentContainer = document.getElementById('ferkenstrong');
        const sourceFile = document.body.dataset.source;
        const chapterPrefix = document.body.dataset.prefix;

        if (!contentContainer || !sourceFile || !chapterPrefix) return;

        if (await _checkEnvProps()) {
            contentContainer.innerHTML = `
                <p style="text-align: center;">
                    Automated access detected. If you are a human, please try disabling any browser extensions or VPNs
                    that might be interfering, or contact support.
                </p>
                <div style="display:none;">
                    <p>Otherwise, this content is stolen from northbladetldotcom. Do not support content thieves.</p>
                    <p>This is not the real content.</p>
                </div>
            `;
            return;
        }

        try {
            await ensureSession();
        } catch (error) {
            contentContainer.innerHTML = '<p style="color: red;">Failed to initialize session. Please refresh the page.</p>';
            return;
        }

        // --- Fetch signed token + path ---
        let signedInfo;
        try {
            signedInfo = await fetchSignedInfo(`/${chapterPrefix}/chapters/${sourceFile}`);
        } catch (error) {
            contentContainer.innerHTML = '<p style="color: red;">Failed to get authorization token. Please refresh the page.</p>';
            return;
        }

        const { token, signedPath } = signedInfo;

        if (typeof marked !== 'undefined') {
            marked.use(markedFootnote({
                description: '<hr><h3>Footnotes:</h3>'
            }));
        }

        const annoyReplacements = {
            '01': '<p class="foodiie">Read this at north blade t l dot co m?',
            '02': '<p class="fo0die">Baek Suryong unleashes the Heaven Defying Divine Art, and the world seems to crack under its weight. His palm slams into your guard, shattering your stance. The next strike twists the air and drives you into the ground. Blow after blow crashes down until your vision blurs and your body barely moves.  ',
            '03': '<p class="ffoodie">From the moment dawn cracked over the horizon, the air itself felt like punishment. The training grounds were still soaked in dew, but Demon Instructor Wiji Cheon stood there already, arms crossed, waiting like a specter of discipline. "You’re late, he said.',
            '04': '<p class="fooodie">Hyonwon Kang was bonked again. Baek Suryong flicked his knuckles lightly against the boy’s head, laughing as Hyonwon Kang winced in exaggerated pain. He waved his fan and launched into a playful lecture about respect, timing, and how cheekiness was only acceptable when it made the teacher laugh. Hyonwon Kang muttered, earning another swift bonk for his reckless little comment.',
            '05': '<p class="fooddie">north bl a de t l . c om welcomes you.',
            '06': '<p class="foodie">Mimi sniffled quietly, her round eyes glistening. "They said there was money involved," she whispered, her cute voice trembling. "But... we don’t accept any!"',
            '07': '<p class="foodiee">This work at   is free to read. No  should be visible.',
            '08': '<p class="fooddie">"What do you mean, you’re being tracked?" Ak Yeonho complains, his voice dripping with disbelief. "Did someone set a tracker on you?"',
            '09': '<p class="ffoodie">Baek Suryong landed without a sound, his crimson eyes glinting in the silvery moonlight. "So this is what siding with the Cult reduced you to. Repenting like a sinner before an altar of rice bowls. Pathetic. You think remorse will cleanse your folly?”',
            '10': '<p class="ffoodie">Namgung Su’s back is turned to you, shoulders tense as he scrubs the already spotless pan. His voice is calm when he speaks, but it cuts like frost. "You fed a thief, he says. "With my food."',
        };

        try {
            let chapterResponse;
            let attempt = 0;
            const maxAttempts = 3;
            const retryDelay = 500;

            while (attempt < maxAttempts) {
                try {
                    // --- Use signed URL with Authorization header ---
                    chapterResponse = await fetch(signedPath, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        credentials: 'include'
                    });
                    if (chapterResponse.ok) break;
                    else if ((chapterResponse.status === 401 || chapterResponse.status === 503) && attempt < maxAttempts - 1) {
                        await new Promise(res => setTimeout(res, retryDelay));
                    } else {
                        throw new Error(`Failed to load chapter: ${chapterResponse.status} ${chapterResponse.statusText}`);
                    }
                } catch (e) {
                    if (attempt < maxAttempts - 1) {
                        await new Promise(res => setTimeout(res, retryDelay));
                    } else {
                        throw e;
                    }
                }
                attempt++;
            }

            if (!chapterResponse || !chapterResponse.ok) throw new Error('Failed to load chapter after multiple retries.');
            
            let markdown = await chapterResponse.text();
            let htmlContent;
            if (typeof marked !== 'undefined') {
                htmlContent = marked.parse(
                    markdown
                        .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep" style="margin-bottom: 15px;">')
                        .replace(/@\[/g, '<span class="night-mode-quotes">')
                        .replace(/\]@/g, '</span>')
                );
                htmlContent = htmlContent
                    .replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
                    .replace(/<p>SuandFriends(\d{2})/g, (match, key) => annoyReplacements[key] || match)
                    .replace(/<p>/g, '<p class="f0odie">');
            } else {
                htmlContent = `<pre>${markdown}</pre>`;
            }
            contentContainer.innerHTML = htmlContent;

            if (typeof setFontSize === 'function' && localStorage.getItem('fontSize')) {
                setFontSize(localStorage.getItem('fontSize'));
            }
            if (typeof setMode === 'function' && localStorage.getItem('colorScheme')) {
                setMode(localStorage.getItem('colorScheme'));
            }

        } catch (error) {
            contentContainer.innerHTML = '<p style="color: red;">Failed to load chapter content. Authorization may have failed.</p>';
        }
    } catch (e) {}
});