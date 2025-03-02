// Set Font Size Automatically
function setFontSize(value) {
	document.getElementById("content").style.fontSize = value;
	var quote = document.getElementsByClassName("night-mode-quotes");
		for (var i = 0; i < quote.length; i++) {
			quote[i].style.fontSize = value;
		}
}
if(localStorage.getItem('fontSize')) {
	var storedSize = localStorage.getItem('fontSize');
	setFontSize(storedSize);
}

// Set Day/Night Mode Automatically
function setMode(value) {
	if (value == "day") {
		document.getElementById("wrappertext").classList.toggle("day-mode");
		document.getElementById("wrappertext").classList.toggle("night-mode");
		//document.getElementById("comment-area").classList.toggle("day-mode-comments");
		var quotes = document.getElementsByClassName("night-mode-quotes");
		for (var i = 0; i < quotes.length; i++) {
			quotes[i].classList.toggle("day-mode-quotes")
			quotes[i].classList.toggle("night-mode-quotes")
		}
	}
}
if(localStorage.getItem('colorScheme')) {
	var storedColor = localStorage.getItem('colorScheme');
	setMode(storedColor);
}

// Change Font Size
var currentSize = 0;
var selectedSize = 0;
function changeFontSize(change) {	
	if (change == '0') {
		selectedSize = "16px";
	}
	else {
		currentSize = parseInt(document.getElementById("content").style.fontSize);
		selectedSize = currentSize + change + 'px';
	}
}

//Change Color
function changeCommentColor() {
	document.getElementById("comment-area").classList.toggle("day-mode-comments");
}