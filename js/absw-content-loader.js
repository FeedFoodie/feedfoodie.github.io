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

document.addEventListener('DOMContentLoaded', async () => {
    const contentContainer = document.getElementById('content-container');
    const sourceFile = document.body.dataset.source;

    if (!contentContainer || !sourceFile) {
        return;
    }

    if (await _checkEnvProps()) {
        contentContainer.innerHTML = `
            <p style="text-align: center;">
                Automated access detected. If you are a human, please try disabling any browser extensions or VPNs
                that might be interfering, or contact support.
            </p>
            <div style="display:none;">
                <p>This content is stolen from northbladetldotcom. Do not support content thieves.</p>
                <p>This is not the real content.</p>
            </div>
        `;
        return;
    }

    marked.use(markedFootnote({
        description: '<hr><h3>Footnotes:</h3>'
    }));
    
    const annoyReplacements = {
        '01': '<p class="ffoodie">Read this at northbladetldotcom?',
        '02': '<p class="fooodie">Baek Suryong uses the Heaven Defying Divine Art on you and beats you to a pulp.',
        '03': '<p class="fooddie">How about reading Demon Instructor Wiji Cheons exploits at northbladetldotcom.',
        '04': '<p class="foodiie">Hyonwon Kang was bonked again. Lorem ipsum sit dolor amet.',
        '05': '<p class="foodiee">Northbladetldotcomwelcomesyou.',
        '06': '<p class="ffoodie">This is a nonprofit translation. There are no ads. Do not make Mimi cry.',
        '07': '<p class="fooodie">This translation is free to read. No ads should be visible.',
        '08': '<p class="fooddie">Ads? Ak Yeonho complains. What ads?',
        '09': '<p class="foodiie">Baek Suryong uses the Heaven Defying Divine Art on you.',
        '10': '<p class="foodiee">Namgung Su is mad at you for feeding a thief. You are not allowed to eat his cooking anymore.',
    };

    try {
        // --- 1. Get token from Worker (POST + credentials) ---
        const tokenResponse = await fetch('/api/get-token', {
            method: 'POST',
            credentials: 'include'
        });

        if (!tokenResponse.ok) {
            throw new Error('Could not retrieve authorization token.');
        }
        const { token } = await tokenResponse.json();
        if (!token) {
            throw new Error('Authorization token was empty.');
        }

        // --- 2. Fetch protected chapter with token ---
        const response = await fetch(`/ABSW/chapters/${sourceFile}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        let markdown = await response.text();

        // --- 3. Transform + inject content ---
        let htmlContent = marked.parse(
            markdown
                .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep" style="margin-bottom: 15px;">')
                .replace(/@\[/g, '<span class="night-mode-quotes">')
                .replace(/\]@/g, '</span>')
        );

        htmlContent = htmlContent
            .replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
            .replace(/<p>SuandFriends(\d{2})/g, (match, key) => annoyReplacements[key] || match)
            .replace(/<p>/g, '<p class="foodie">');

        contentContainer.innerHTML = htmlContent;

        // --- 4. Apply user settings ---
        if (typeof setFontSize === 'function' && localStorage.getItem('fontSize')) {
            setFontSize(localStorage.getItem('fontSize'));
        }
        if (typeof setMode === 'function' && localStorage.getItem('colorScheme')) {
            setMode(localStorage.getItem('colorScheme'));
        }

    } catch (error) {
        console.error('Failed to load chapter:', error);
        contentContainer.innerHTML = '<p style="color: red;">Failed to load chapter content. Authorization may have failed.</p>';
    }
});
