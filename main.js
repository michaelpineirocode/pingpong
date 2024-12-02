var mode = null;

function changeStyle() {
  newStyle = "styles/" + document.getElementById('styles').value + "/menu.css";
  document.getElementById("styleSheet").href = newStyle;
}

function setMode(button, mode){
  Array.from(document.getElementsByClassName("play-mode-button")).forEach(element => {
    element.style.borderColor = 'black';
  });
  button.style.borderColor = 'white';
  this.mode = mode;
}

function start() {
  if (!mode) {
    alert("You must select a mode before starting the game.")
    return;
  }

  document.location = `index.html?mode=${encodeURIComponent(mode)}`;
}
