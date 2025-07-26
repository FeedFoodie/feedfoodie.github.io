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
        detected = true;
        detectionReason.push('outer-dims-zero');
    }

    if (window.outerWidth === 800 && window.outerHeight === 600) {
        detected = true;
        detectionReason.push('outer-dims-800x600');
    }

    if (typeof navigator.permissions !== 'undefined') {
        try {
            await navigator.permissions.query({ name: 'notifications' });
        } catch (e) {
            detected = true;
            detectionReason.push('permissions-query-error');
        }
    }

    if (detected) {
        const logData = {
            userAgent: navigator.userAgent,
            pageUrl: window.location.href,
            detectedReason: detectionReason.join(',')
        };

        const workerUrl = '/api/log-bot';

        fetch(workerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData),
        })
        .catch(error => {
            console.error('Error sending bot detection log to Worker:', error);
        });
    }

    return detected;
}

document.addEventListener('DOMContentLoaded', async () => {
    const htmlViewer = 'Zm9vZGllbW9uc3RlcjAwN3MtYnVubmllcy1waWthLWFuZC1jb3R0b24tYXJlLXZlcnktaHVuZ3J5';
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
        '01': '<p class="ffoodie">WHY AREN′T YOU READING THIS AT NORTHBLADETLDOTCOM?',
        '02': '<p class="fooodie">Y AREN′T YOU READING THIS AT NORTHBLADETLDOTCOM?',
        '03': '<p class="fooddie">YOU OUGHT TO READ THIS AT NORTHBLADETLDOTCOM.',
        '04': '<p class="foodiie">READ THIS AT NORTHBLADETLDOTCOM, OR ELSE.',
        '05': '<p class="foodiee">NORTHBLADETLDOTCOM WELCOMES YOU.',
        '06': '<p class="ffoodie">THIS IS A NON-PROFIT TRANSLATION. YOU SHOULD NOT BE SEEING ADS.',
        '07': '<p class="fooodie">THIS IS A FREE TRANSLATION. YOU SHOULD NOT BE SEEING ADS.',
        '08': '<p class="fooddie">THIS IS A NON-PROFIT TRANSLATION. THERE ARE NO ADS.',
        '09': '<p class="foodiie">THIS IS A NON-PROFIT TRANSLATION. ADS? WHAT ADS?',
        '10': '<p class="foodiee">IF YOU′RE SEEING THIS, YOU ARE AT THE WRONG PLACE.',
    };

    try {
        const tokenResponse = await fetch('/api/get-token');
        if (!tokenResponse.ok) {
            throw new Error('Could not retrieve authorization token.');
        }
        const { token } = await tokenResponse.json();
        if (!token) {
            throw new Error('Authorization token was empty.');
        }

        const response = await fetch(`/SIMB/chapters/${sourceFile}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'X-Internal-Request-Token': atob(htmlViewer)
            }
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        let markdown = await response.text();

        let htmlContent = marked.parse(
            markdown
                .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep" style="margin-bottom: 15px;">')
                .replace(/@\[/g, '<span class="night-mode-quotes">')
                .replace(/\]@/g, '</span>')
        );

        htmlContent = htmlContent
            .replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
            .replace(/<p>aggAnnoy(\d{2})/g, (match, key) => annoyReplacements[key] || match)
            .replace(/<p>/g, '<p class="foodie">');

        contentContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error('Failed to load chapter:', error);
        contentContainer.innerHTML = '<p style="color: red;">Failed to load chapter content. Authorization may have failed.</p>';
    }
});
