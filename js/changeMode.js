// Change Font Size
var currentSize = 0;
function changeFontSize(change) {  
	if (change == '0') {
		document.getElementById("content").style.fontSize = "16px";
		var quote = document.getElementsByClassName("night-mode-quotes");
		for (var i = 0; i < quote.length; i++) {
		  quote[i].style.fontSize = "16px";
		}
	}
     else {
		currentSize = parseInt(document.getElementById("content").style.fontSize);
        document.getElementById("content").style.fontSize = currentSize + change + 'px';
		var quote = document.getElementsByClassName("night-mode-quotes");
		for (var i = 0; i < quote.length; i++) {
		  quote[i].style.fontSize = currentSize + change + 'px';
		}
	}	
}

//Change Color
function changeWrapColor() {
	document.getElementById("wrappertext").classList.toggle("day-mode");
	var quotes = document.getElementsByClassName("night-mode-quotes");
	for (var i = 0; i < quotes.length; i++) {
	  quotes[i].classList.toggle("day-mode-quotes")
	}
}

