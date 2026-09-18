```js
// ===============================
// PUBLIC HLS STREAM
// ===============================
const STREAM_URL =
  "https://incentive-infrared-block-realized.trycloudflare.com/live/index.m3u8";


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
  databaseURL:
    "https://cricket-live-39106-default-rtdb.asia-southeast1.firebasedatabase.app",
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

viewerRef.onDisconnect().remove();

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

    // Don't stay too close to live edge.
    // More stable for your current tunnel.
    lowLatencyMode: false,

    // Start a few segments behind live edge.
    initialLiveManifestSize: 3,
    liveSyncDurationCount: 4,
    liveMaxLatencyDurationCount: 10,

    // Give the player more room to recover.
    maxBufferLength: 30,
    maxMaxBufferLength: 60,

    // Small gaps in segments can be tolerated.
    maxBufferHole: 0.5,

    // Keep some already-played media.
    backBufferLength: 30
  });


  // ===============================
  // LOAD STREAM
  // ===============================
  hls.loadSource(STREAM_URL);
  hls.attachMedia(video);


  // ===============================
  // MANIFEST LOADED
  // ===============================
  hls.on(Hls.Events.MANIFEST_PARSED, () => {

    console.log("HLS manifest loaded.");

    hideOverlay();

    video.play().catch(() => {
      console.log("Autoplay blocked. Press Play.");
    });

  });


  // ===============================
  // HLS ERROR HANDLING
  // ===============================
  hls.on(Hls.Events.ERROR, (_, data) => {

    console.warn(
      "HLS ERROR:",
      data.type,
      data.details,
      "fatal:",
      data.fatal
    );


    if (!data.fatal) {
      return;
    }


    // Network error
    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {

      console.log("Network error. Retrying stream...");

      showWaiting("Reconnecting to live stream...");

      hls.startLoad();

    }


    // Media/decode error
    else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {

      console.log("Media error. Recovering...");

      hls.recoverMediaError();

    }


    // Unknown fatal error
    else {

      console.error("Fatal HLS error:", data);

      showWaiting("Stream unavailable. Please try again.");

    }

  });


} else if (video.canPlayType("application/vnd.apple.mpegurl")) {

  // ===============================
  // NATIVE HLS
  // ===============================

  video.src = STREAM_URL;

  video.addEventListener("loadedmetadata", () => {

    hideOverlay();

    video.play().catch(() => {
      console.log("Autoplay blocked. Press Play.");
    });

  });


} else {

  showWaiting("This browser does not support HLS playback.");

}
```
