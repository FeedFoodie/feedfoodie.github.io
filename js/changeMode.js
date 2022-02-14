// Change Font Size
var currentSize = 0;
function changeFontSize(change) {  
	if (change == '0') {
		document.getElementById("content").style.fontSize = "16px";
	}
     else {
		currentSize = parseInt(document.getElementById("content").style.fontSize);
        document.getElementById("content").style.fontSize = currentSize + change + 'px';
	}	
}

//Change Color
function changeWrapColor() {
	document.getElementById("wrappertext").classList.toggle("day-mode");
}