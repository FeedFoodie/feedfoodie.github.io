function applyTextCorrection(text) {
    const symbolMap = {'☁':'e','☉':'t','☍':'a','☛':'o','☢':'i','☠':'n','☣':'s','☯':'r','☹':'h'};
    let corrected = "";
    for(let i = 0; i < text.length; i++) {
        const char = text[i];
        corrected += symbolMap[char] || char;
    }
    return corrected;
}

function renderMarkdownText(text) {
    let processed = applyTextCorrection(text);
    if (typeof marked !== 'undefined') {
        processed = marked.parse(processed
            .replace(/{sep}/g, '<img src="/Images/sep.png" alt="sep" style="margin-bottom: 15px;">')
            .replace(/@\[/g, '<span class="night-mode-quotes">')
            .replace(/\]@/g, '</span>')
        );
        processed = processed
            .replace(/<blockquote>/g, '<blockquote class="night-mode-quotes">')
            .replace(/♄monster[a-q]♄(.*?)♆/g, '$1')
            .replace(/♄(monster|moonster|monsster|monstter|monsteer|monsterr|monstterr)♄(.*?)♆/g, '<span class="$1">$2</span>')
            .replace(/☆(f0odie|foodie|ffoodie|fooddie|fo0die|foodiie|foodiee)☆(.*?)★/gs, '<p class="$1">$2</p>')
            .replace(/<p>/g, '<p class="fooodie">');
    } else {
        processed = `<pre>${processed}</pre>`;
    }
    return processed;
}

async function processMarkdownContent(containerId, token, signedPath) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(signedPath, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include'
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const contentType = response.headers.get('content-type') || '';
        let part1 = '', part2 = '';

        if (contentType.includes('application/json')) {
            const json = await response.json();
            part1 = json.part1;
            part2 = json.part2;
        } else {
            part1 = await response.text();
        }

        // 1. Render part1 immediately
        container.innerHTML = renderMarkdownText(part1);

        if (typeof setFontSize === 'function' && localStorage.getItem('fontSize')) {
            setFontSize(localStorage.getItem('fontSize'));
        }
        if (typeof setMode === 'function' && localStorage.getItem('colorScheme')) {
            setMode(localStorage.getItem('colorScheme'));
        }

        // 2. If part2 exists, set up human interaction detection
        if (part2) {
            setupHumanInteractionDetection(container, part2, token, signedPath);
        }
    } catch (error) {
        container.innerHTML = '<p style="color: red;">Failed to load chapter content. Authorization may have failed.</p>';
        console.error('Markdown processing error:', error);
    }
}

function setupHumanInteractionDetection(container, part2, token, signedPath) {
    let humanScore = 0;
    const SCORE_THRESHOLD = 10;
    let isPart2Loaded = false;
    
    // Interaction tracking variables
    let lastInteractionTime = Date.now();
    let mousePositions = [];
    let touchStartTime = null;
    let scrollPattern = [];
    let interactionCount = 0;
    
    // Helper function to load part2
    const loadPart2Content = () => {
        if (isPart2Loaded) return;
        isPart2Loaded = true;
        
        const part2Html = renderMarkdownText(part2);
        container.insertAdjacentHTML('beforeend', part2Html);
        
        if (typeof setFontSize === 'function' && localStorage.getItem('fontSize')) {
            setFontSize(localStorage.getItem('fontSize'));
        }
        if (typeof setMode === 'function' && localStorage.getItem('colorScheme')) {
            setMode(localStorage.getItem('colorScheme'));
        }
        
        // Clean up event listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('keydown', handleKeydown);
    };
    
    // Score calculation helper
    const addHumanScore = (points, reason) => {
        humanScore += points;
        if (humanScore >= SCORE_THRESHOLD && !isPart2Loaded) {
            console.log('Human interaction detected, loading part2...');
            loadPart2Content();
        }
    };
    
    // 1. MOUSE MOVEMENT DETECTION (Desktop)
    const handleMouseMove = (e) => {
        interactionCount++;
        const now = Date.now();
        const timeDiff = now - lastInteractionTime;
        
        // Store recent positions for pattern analysis
        mousePositions.push({
            x: e.clientX,
            y: e.clientY,
            time: now
        });
        
        if (mousePositions.length > 10) {
            mousePositions.shift();
        }
        
        // Detect non-linear mouse movement (human-like)
        if (mousePositions.length >= 3) {
            const recent = mousePositions.slice(-3);
            const dx1 = recent[1].x - recent[0].x;
            const dy1 = recent[1].y - recent[0].y;
            const dx2 = recent[2].x - recent[1].x;
            const dy2 = recent[2].y - recent[1].y;
            
            // Calculate angle change (non-linear movement)
            const angleChange = Math.abs(Math.atan2(dy2, dx2) - Math.atan2(dy1, dx1));
            
            // Humans rarely move in perfectly straight lines
            if (angleChange > 0.1 && angleChange < 2.0) {
                addHumanScore(2, 'non-linear mouse movement');
            }
        }
        
        // Random timing between interactions
        if (timeDiff > 50 && timeDiff < 2000) {
            addHumanScore(1, 'natural timing between mouse movements');
        }
        
        lastInteractionTime = now;
    };
    
    // 2. TOCH INTERACTION DETECTION (Mobile)
    let lastTouchY = null;
    let touchMoveCount = 0;
    
    const handleTouchStart = (e) => {
        touchStartTime = Date.now();
        if (e.touches.length === 1) {
            lastTouchY = e.touches[0].clientY;
        }
        touchMoveCount = 0;
    };
    
    const handleTouchMove = (e) => {
        if (!touchStartTime || e.touches.length !== 1) return;
        
        touchMoveCount++;
        const currentY = e.touches[0].clientY;
        
        // Detect natural scrolling/swiping
        if (lastTouchY !== null && Math.abs(currentY - lastTouchY) > 5) {
            addHumanScore(1, 'touch movement detected');
        }
        
        lastTouchY = currentY;
        
        // Multiple touch moves suggest natural interaction
        if (touchMoveCount > 3) {
            addHumanScore(2, 'sustained touch interaction');
        }
    };
    
    const handleTouchEnd = (e) => {
        if (!touchStartTime) return;
        
        const touchDuration = Date.now() - touchStartTime;
        
        // Natural touch duration (not too short, not too long)
        if (touchDuration > 100 && touchDuration < 2000) {
            addHumanScore(2, 'natural touch duration');
        }
        
        touchStartTime = null;
    };
    
    // 3. SCROLL BEHAVIOR DETECTION (Both)
    let lastScrollTime = 0;
    let scrollDirectionChanges = 0;
    let lastScrollTop = window.scrollY;
    
    const handleScroll = () => {
        const now = Date.now();
        const timeSinceLastScroll = now - lastScrollTime;
        const currentScrollTop = window.scrollY;
        
        // Store scroll pattern
        scrollPattern.push({
            time: now,
            position: currentScrollTop,
            delta: Math.abs(currentScrollTop - lastScrollTop)
        });
        
        if (scrollPattern.length > 5) {
            scrollPattern.shift();
        }
        
        // Detect natural scrolling patterns
        if (timeSinceLastScroll > 50 && timeSinceLastScroll < 1000) {
            addHumanScore(1, 'natural scroll timing');
        }
        
        // Detect scroll direction changes (humans often overshoot)
        if (scrollPattern.length >= 2) {
            const direction = currentScrollTop > lastScrollTop ? 'down' : 'up';
            const prevDirection = scrollPattern.length >= 2 ? 
                (scrollPattern[scrollPattern.length - 2].position < scrollPattern[scrollPattern.length - 3]?.position ? 'down' : 'up') : null;
            
            if (prevDirection && direction !== prevDirection) {
                scrollDirectionChanges++;
                if (scrollDirectionChanges > 1) {
                    addHumanScore(3, 'scroll direction changes');
                }
            }
        }
        
        lastScrollTime = now;
        lastScrollTop = currentScrollTop;
    };
    
    // 4. CLICK/TAP DETECTION
    const handleClick = (e) => {
        const now = Date.now();
        const timeDiff = now - lastInteractionTime;
        
        // Natural reaction time for clicks
        if (timeDiff > 100 && timeDiff < 3000) {
            addHumanScore(3, 'natural click timing');
        }
        
        // Multiple different click locations
        if (interactionCount > 2) {
            addHumanScore(2, 'multiple interaction points');
        }
        
        lastInteractionTime = now;
        interactionCount++;
    };
    
    // 5. KEYBOARD INTERACTION
    const handleKeydown = (e) => {
        // Common human keys (not just tab/arrow keys)
        if (e.key.length === 1 || e.key === ' ' || e.key === 'Enter' || e.key === 'Backspace') {
            addHumanScore(2, 'keyboard interaction');
        }
    };
    
    // Set up event listeners with passive where appropriate
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });
    document.addEventListener('keydown', handleKeydown, { passive: true });
    
    // Fallback: If no "human-like" interactions detected after 30 seconds,
    // load part2 anyway (accessibility consideration)
    setTimeout(() => {
        if (!isPart2Loaded) {
            console.log('Fallback: Loading part2 after timeout');
            loadPart2Content();
        }
    }, 30000);
}

window.addEventListener('ContentReady', function(event) {
    const { containerId, token, signedPath } = event.detail;
    processMarkdownContent(containerId, token, signedPath);
});