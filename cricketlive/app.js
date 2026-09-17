// ===============================
// PUBLIC HLS STREAM
// ===============================
const STREAM_URL = "https://moctobpltc-i.akamaihd.net/hls/live/571329/eight/playlist.m3u8";

// ===============================
// VIDEO PLAYER
// ===============================
const video = document.getElementById("player");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");

function hideOverlay() {
  overlay.classList.add("hidden");
}

function showWaiting(text) {
  message.textContent = text;
  overlay.classList.remove("hidden");
}


// ===============================
// FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyDm3DIHJfRPEqNqrUlYJutRQm8XIA6H3fs",
  authDomain: "cricket-live-39106.firebaseapp.com",
  databaseURL: "https://cricket-live-39106-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cricket-live-39106",
  storageBucket: "cricket-live-39106.firebasestorage.app",
  messagingSenderId: "841890143",
  appId: "1:841890143:web:ca5b87c9395bdc19145eea",
  measurementId: "G-ZNEZC8YVMX"
};


// ===============================
// INITIALIZE FIREBASE
// ===============================
firebase.initializeApp(firebaseConfig);

const database = firebase.database();


// ===============================
// LIVE VIEWER COUNT
// ===============================
const viewerCountElement = document.getElementById("viewerCount");

const viewerRef = database.ref("liveViewers").push();

// Tell Firebase to remove this viewer
// automatically when the user disconnects.
viewerRef.onDisconnect().remove();

// Add this viewer
viewerRef.set(true);

database.ref("liveViewers").on("value", (snapshot) => {
  const count = snapshot.numChildren();

  if (viewerCountElement) {
    viewerCountElement.textContent = `👁 ${count} Watching`;
  }
});

// ===============================
// HLS PLAYER
// ===============================
if (!STREAM_URL || STREAM_URL.includes("PASTE_PUBLIC")) {

  showWaiting("Add your public HLS stream URL in app.js");

} else if (window.Hls && Hls.isSupported()) {

  const hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true
  });

  hls.loadSource(STREAM_URL);
  hls.attachMedia(video);

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    hideOverlay();
  });

  hls.on(Hls.Events.ERROR, (_, data) => {

    if (data.fatal) {
      showWaiting("Stream unavailable. Check the stream URL.");
    }

  });

} else if (video.canPlayType("application/vnd.apple.mpegurl")) {

  video.src = STREAM_URL;

  video.addEventListener("loadedmetadata", hideOverlay);

} else {

  showWaiting("This browser does not support HLS playback.");

}
