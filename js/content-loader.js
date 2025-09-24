// --- Bot detection ---
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

    if (finderskeepers.includes(navigator.userAgent)) return true;

    let detected = false;
    const isChromium = navigator.userAgent.includes("Chrome/");

    if (navigator.webdriver) detected = true;

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const renderer = gl.getParameter(gl.RENDERER);
            if (renderer.includes('SwiftShader') || renderer.includes('Mesa')) detected = true;
        } else {
            detected = true;
        }
    } catch {
        detected = true;
    }

    if (navigator.languages && navigator.languages.length === 0) detected = true;
    if ((window.outerWidth === 0 && window.outerHeight === 0 && !isChromium) || (window.outerWidth === 800 && window.outerHeight === 600)) detected = true;

    return detected; // true = bot detected, false = human
}

// --- Main loader ---
document.addEventListener('DOMContentLoaded', async () => {
    const contentContainer = document.getElementById('content-container');
    if (!contentContainer) return;

    // Detect chapter number from <body> or <h1>
    let sourceFile = document.body.dataset.source;
    if (!sourceFile) {
        const titleText = document.querySelector('h1')?.innerText || '';
        const match = titleText.match(/Chapter (\d+)/i);
        sourceFile = match ? match[1] : null;
    }

    const prefix = document.body.dataset.prefix;
    if (!sourceFile || !prefix) return;

    // Block bots
    if (await _checkEnvProps()) {
        contentContainer.innerHTML = `
            <p style="text-align:center;">
                Automated access detected. Please disable VPNs/extensions or contact support.
            </p>
            <div style="display:none;">
                <p>This content is stolen from northbladetldotcom. Do not support content thieves.</p>
            </div>
        `;
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
        const tokenResp = await fetch('/api/get-token');
        if (!tokenResp.ok) throw new Error('Could not get auth token.');
        const { token } = await tokenResp.json();

        const response = await fetch(`/chapters/${prefix}/${sourceFile}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Chapter fetch failed.');
        let markdown = await response.text();

        let htmlContent = marked.parse(
            markdown
                .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep" style="margin-bottom:15px;">')
                .replace(/@\[/g, '<span class="night-mode-quotes">')
                .replace(/\]@/g, '</span>')
        );

        htmlContent = htmlContent
            .replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
            .replace(/<p>SuandFriends(\d{2})/g, (m, k) => annoyReplacements[k] || m)
            .replace(/<p>/g, '<p class="foodie">');

        contentContainer.innerHTML = htmlContent;
    } catch (err) {
        console.error(err);
        contentContainer.innerHTML = '<p style="color:red;">Failed to load chapter content.</p>';
    }
});
