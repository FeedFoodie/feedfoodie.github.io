document.addEventListener('DOMContentLoaded', async () => {
    const contentContainer = document.getElementById('content-container');
    const sourceFile = document.body.dataset.source;

    if (!contentContainer || !sourceFile) {
        return;
    }

    // Set up marked.js if needed
    if (typeof marked !== 'undefined') {
        marked.use(markedFootnote({
            description: '<hr><h3>Footnotes:</h3>'
        }));
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
        // Step 1: Initialize session. This call sets the session cookie.
        const sessionResponse = await fetch('/api/init-session', {
            method: 'GET',
            credentials: 'include'
        });

        if (!sessionResponse.ok) {
            throw new Error('Failed to initialize session');
        }
        
        console.log('Session initialized. Now getting authorization token.');

        // Step 2: Request token with credentials to include session cookie
        const tokenResponse = await fetch('/api/get-token', {
            credentials: 'include'
        });
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            throw new Error(`Could not retrieve authorization token: ${tokenResponse.status} - ${errorData}`);
        }
        
        let token;
        try {
            const result = await tokenResponse.json();
            token = result.token;
            console.log('Received token:', token);
        } catch (jsonError) {
            throw new Error(`Failed to parse token response as JSON: ${jsonError.message}`);
        }

        if (!token) {
            throw new Error('Authorization token was empty.');
        }

        console.log('Token received. Now fetching chapter content.');

        // Step 3: Request chapter content with token
        const response = await fetch(`/chapters/SIMB/${sourceFile}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error(`Failed to load chapter: ${response.status} ${response.statusText}`);
        }
        
        let markdown = await response.text();

        // Process markdown if marked.js is available
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
                .replace(/<p>/g, '<p class="foodie">');
        } else {
            // Fallback: just display the raw markdown
            htmlContent = `<pre>${markdown}</pre>`;
        }

        contentContainer.innerHTML = htmlContent;

        // Apply settings from localStorage
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
