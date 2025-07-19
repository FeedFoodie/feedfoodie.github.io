function _checkEnvProps() {
    let detected = false;

    if (navigator.webdriver) {
        detected = true;
    }

    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                if (renderer.includes('SwiftShader') || renderer.includes('Mesa')) {
                    detected = true;
                }
            }
        } else {
            detected = true;
        }
    } catch (e) {
        detected = true;
    }

    if (window.outerWidth === 0 && window.outerHeight === 0) {
        detected = true;
    }

    if (window.outerWidth === 800 && window.outerHeight === 600) {
        detected = true;
    }

    if (navigator.hardwareConcurrency < 2) {
        // This is highly prone to false positives for users on single-core CPUs, VMs, or older devices.
        // I recommend commenting this out or removing it entirely unless you have specific reasons.
        // detected = true;
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

    if (_checkEnvProps()) {
        contentContainer.innerHTML = `
            <h1 style="color: red; text-align: center;">ACCESS DENIED</h1>
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
        const response = await fetch(`/ABSW/chapters/${sourceFile}`, {
            headers: {
                'X-Internal-Request-Token': atob(htmlViewer)
            }
        });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        let markdown = await response.text();

        let htmlContent = marked.parse(
            markdown
                .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep">')
                .replace(/@\[/g, '<span class="night-mode-quotes">')
                .replace(/\]@/g, '</span>')
        );

        htmlContent = htmlContent
            .replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
            .replace(/<p>aggAnnoy(\d{2})/g, (match, key) => annoyReplacements[key] || match)
            .replace(/<p>/g, '<p class="foodie">');

        contentContainer.innerHTML = htmlContent;

    } catch (error) {
        contentContainer.innerHTML = '<p style="color: red;">Failed to load chapter content.</p>';
    }
});