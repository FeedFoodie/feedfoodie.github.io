function navbarDropdown(id) {
  // On desktop, do nothing – hover handles it
  if (window.innerWidth >= 601) {
    return;
  }
  // Mobile: toggle dropdown
  var dropdown = document.getElementById(id);
  dropdown.classList.toggle("show");
}
window.onclick=function(o){if(!o.target.matches(".dropbtn")){var n=document.getElementById("novelDropdown");n.classList.contains("show")&&n.classList.remove("show")}};