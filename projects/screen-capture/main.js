const videoElem = document.getElementById("video");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");

async function startCapture() {
  
    try {
      videoElem.srcObject = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
      dumpOptionsInfo();
    } catch(err) {
      console.error("Error: " + err);
    }
  }

function stopCapture(evt) {
    let tracks = videoElem.srcObject.getTracks();
  
    tracks.forEach(track => track.stop());
    videoElem.srcObject = null;
  }

// Options for getDisplayMedia()

var displayMediaOptions = {
  video: {
    cursor: "always"
  },
  audio: false
};

// Set event listeners for the start and stop buttons
startElem.addEventListener("click", function(evt) {
  startCapture();
}, false);

stopElem.addEventListener("click", function(evt) {
  stopCapture();
}, false);