function navbarDropdown(id) {
  var dropdown = document.getElementById(id);
  dropdown.classList.toggle("show");
  // Optional: close others
  document.querySelectorAll('.dropdown-content.show').forEach(function(el) {
    if (el.id !== id) el.classList.remove('show');
  });
}
window.onclick=function(o){if(!o.target.matches(".dropbtn")){var n=document.getElementById("novelDropdown");n.classList.contains("show")&&n.classList.remove("show")}};