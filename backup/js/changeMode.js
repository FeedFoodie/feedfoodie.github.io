// Set Font Size Automatically
function setFontSize(value) {
    const contentElement = document.getElementById("content");
    if (contentElement) {
        contentElement.style.fontSize = value;
    }
    const quotes = document.getElementsByClassName("night-mode-quotes");
    for (let i = 0; i < quotes.length; i++) {
        quotes[i].style.fontSize = value;
    }
}

// Set Day/Night Mode Automatically
function setMode(value) {
    if (value == "day") {
        document.getElementById("wrappertext")?.classList.toggle("day-mode");
        document.getElementById("chapterTitle")?.classList.toggle("day-mode-heading");
        const quotes = document.getElementsByClassName("night-mode-quotes");
        for (let i = 0; i < quotes.length; i++) {
            quotes[i].classList.toggle("day-mode-quotes")
        }
    }
}

// Change Font Size
function changeFontSize(change) {
    const contentElement = document.getElementById("content");
    if (!contentElement) return;

    const delta = Number(change);
    let newSize;

    if (delta === 0) {
        newSize = "16px";
    } else {
        const currentSize = parseInt(window.getComputedStyle(contentElement).fontSize);
        newSize = (currentSize + delta) + 'px';
    }

    localStorage.setItem('fontSize', newSize);
    setFontSize(newSize);
}

//Change Color
function changeWrapColor() {
    const wrapper = document.getElementById("wrappertext");
    const chapterTitle = document.getElementById("chapterTitle");
    const quotes = document.getElementsByClassName("night-mode-quotes");

    wrapper.classList.toggle("day-mode");
    chapterTitle.classList.toggle("day-mode-heading");
    for (let i = 0; i < quotes.length; i++) {
        quotes[i].classList.toggle("day-mode-quotes");
    }

    if (wrapper.classList.contains("day-mode")) {
        localStorage.setItem('colorScheme', "day");
    } else {
        localStorage.setItem('colorScheme', "night");
    }
}