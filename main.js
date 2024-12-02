function changeStyle() {
  newStyle = "styles/" + document.getElementById('styles').value + "/menu.css";
  document.getElementById("styleSheet").href = newStyle;
}
