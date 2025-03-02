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
		localStorage.setItem('fontSize', selectedSize);
		document.getElementById("content").style.fontSize = selectedSize;
		var quote = document.getElementsByClassName("night-mode-quotes");
		for (var i = 0; i < quote.length; i++) {
			quote[i].style.fontSize = selectedSize;
		}
	}
	else {
		currentSize = parseInt(document.getElementById("content").style.fontSize);
		selectedSize = currentSize + change + 'px';
		localStorage.setItem('fontSize', selectedSize);
		document.getElementById("content").style.fontSize = selectedSize;
		var quote = document.getElementsByClassName("night-mode-quotes");
		for (var i = 0; i < quote.length; i++) {
			quote[i].style.fontSize = selectedSize;
		}
	}
}

//Change Color
function changeWrapColor() {
	document.getElementById("wrappertext").classList.toggle("day-mode");
	document.getElementById("comment-area").classList.toggle("day-mode-comments");
	var quotes = document.getElementsByClassName("night-mode-quotes");
	for (var i = 0; i < quotes.length; i++) {
		quotes[i].classList.toggle("day-mode-quotes")
	}
	if (document.getElementById("wrappertext").classList.contains("day-mode")) {
		localStorage.setItem('colorScheme', "day");
	}
	else {
		localStorage.setItem('colorScheme', "night");
	}
}

// When the user clicks on the button, toggle between hiding and showing the dropdown content
function navbarDropdown() {
	document.getElementById("novelDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(e) {
	if (!e.target.matches('.dropbtn')) {
	var novelDropdown = document.getElementById("novelDropdown");
		if (novelDropdown.classList.contains('show')) {
			novelDropdown.classList.remove('show');
		}
	}
}

