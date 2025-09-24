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

    if (finderskeepers.includes(navigator.userAgent)) return false;

    let detected = false;
    const ua = navigator.userAgent;
    const isChromium = ua.includes("Chrome/");

    if (navigator.webdriver) detected = true;

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const renderer = gl.getParameter(gl.RENDERER);
            if (renderer.includes('SwiftShader') || renderer.includes('Mesa')) detected = true;
        } else detected = true;
    } catch { detected = true; }

    if (navigator.languages?.length === 0) detected = true;
    if ((window.outerWidth === 0 && window.outerHeight === 0 && !isChromium) || (window.outerWidth === 800 && window.outerHeight === 600)) detected = true;

    console.log('[EnvCheck] Detected automated environment:', detected);
    return detected;
}

document.addEventListener('DOMContentLoaded', async () => {
    const contentContainer = document.getElementById('content-container');
    const sourceFile = document.body.dataset.source;
    if (!contentContainer || !sourceFile) {
        console.log('[Loader] Missing content container or source file.');
        return;
    }

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
        // 1. Initialize session
        console.log('[Loader] Initializing session...');
        const initResp = await fetch('/api/init-session', { method: 'POST', credentials: 'include' });
        console.log('[Loader] /api/init-session status:', initResp.status);
        console.log('[Loader] /api/init-session headers:', [...initResp.headers]);

        // 2. Wait for Turnstile token
        console.log('[Loader] Waiting for Turnstile token...');
        while (!window.turnstileToken) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        console.log('[Loader] Turnstile token obtained:', window.turnstileToken);

        // 3. Anti-bot check
        if (await _checkEnvProps()) {
            console.log('[Loader] Automated access detected.');
            contentContainer.innerHTML = `
                <p style="text-align:center;">Automated access detected. Complete CAPTCHA or contact support.</p>
                <div style="display:none;">
                    <p>This content is stolen from northbladetldotcom. Do not support content thieves.</p>
                </div>`;
            return;
        }

        // 4. Get single-use token
        console.log('[Loader] Fetching single-use token...');
        const tokenResp = await fetch('/api/get-token', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ turnstileToken: window.turnstileToken })
        });
        console.log('[Loader] /api/get-token status:', tokenResp.status);
        console.log('[Loader] /api/get-token headers:', [...tokenResp.headers]);
        const tokenText = await tokenResp.text();
        console.log('[Loader] /api/get-token response body:', tokenText);
        if (!tokenResp.ok) throw new Error('Authorization failed.');
        const { token } = JSON.parse(tokenText);
        console.log('[Loader] Token received:', token);
        if (!token) throw new Error('Token empty.');

        // 5. Fetch chapter
        console.log('[Loader] Fetching chapter:', sourceFile);
        const chapterResp = await fetch(`/chapters/${sourceFile}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });
        console.log('[Loader] /chapters fetch status:', chapterResp.status);
        console.log('[Loader] /chapters fetch headers:', [...chapterResp.headers]);
        const chapterText = await chapterResp.text();
        console.log('[Loader] /chapters response length:', chapterText.length);
        if (!chapterResp.ok) throw new Error('Chapter fetch failed.');

        // 6. Convert markdown to HTML
        marked.use(markedFootnote({ description: '<hr><h3>Footnotes:</h3>' }));
        let htmlContent = marked.parse(
            chapterText.replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep" style="margin-bottom:15px;">')
                    .replace(/@\[/g, '<span class="night-mode-quotes">')
                    .replace(/\]@/g, '</span>')
        );

        htmlContent = htmlContent
            .replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
            .replace(/<p>SuandFriends(\d{2})/g, (m,k) => annoyReplacements[k] || m)
            .replace(/<p>/g, '<p class="foodie">');

        contentContainer.innerHTML = htmlContent;
        console.log('[Loader] Chapter rendered successfully.');

        if (typeof setFontSize === 'function' && localStorage.getItem('fontSize')) {
            setFontSize(localStorage.getItem('fontSize'));
        }
        if (typeof setMode === 'function' && localStorage.getItem('colorScheme')) {
            setMode(localStorage.getItem('colorScheme'));
        }

    } catch (err) {
        console.error('[Loader] Error:', err);
        contentContainer.innerHTML = '<p style="color:red;">Failed to load content. Complete CAPTCHA or try again later.</p>';
    }
});
