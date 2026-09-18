// ==========================================
// CRICKET LIVE - PLAYER + FIREBASE
// ==========================================

// Your current public HLS stream
const STREAM_URL =
  "https://incentive-infrared-block-realized.trycloudflare.com/live/index.m3u8";


// ==========================================
// VIDEO ELEMENTS
// ==========================================

const video = document.getElementById("player");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");


// ==========================================
// OVERLAY
// ==========================================

function hideOverlay() {
  if (overlay) {
    overlay.classList.add("hidden");
  }
}

function showWaiting(text) {
  if (message) {
    message.textContent = text;
  }

  if (overlay) {
    overlay.classList.remove("hidden");
  }
}


// ==========================================
// FIREBASE
// ==========================================

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


firebase.initializeApp(firebaseConfig);

const database = firebase.database();


// ==========================================
// VIEWER COUNT
// ==========================================

const viewerCountElement =
  document.getElementById("viewerCount");

const viewerRef =
  database.ref("liveViewers").push();

viewerRef.onDisconnect().remove();

viewerRef.set(true);

database.ref("liveViewers").on("value", (snapshot) => {

  const count = snapshot.numChildren();

  if (viewerCountElement) {
    viewerCountElement.textContent =
      `👁 ${count} Watching`;
  }

});


// ==========================================
// HLS PLAYER
// ==========================================

if (!STREAM_URL) {

  showWaiting("Stream URL is missing.");

}
else if (!window.Hls) {

  showWaiting("HLS.js failed to load.");

  console.error("HLS.js is not available.");

}
else if (Hls.isSupported()) {

  console.log("HLS.js supported.");

  const hls = new Hls({

    enableWorker: true,

    // More stable for the current public tunnel
    lowLatencyMode: false,

    // Keep a reasonable live buffer
    initialLiveManifestSize: 3,

    liveSyncDurationCount: 4,

    liveMaxLatencyDurationCount: 10,

    maxBufferLength: 30,

    maxMaxBufferLength: 60,

    backBufferLength: 30,

    maxBufferHole: 0.5

  });


  // ========================================
  // LOAD STREAM
  // ========================================

  hls.loadSource(STREAM_URL);

  hls.attachMedia(video);


  // ========================================
  // MANIFEST LOADED
  // ========================================

  hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {

    console.log(
      "HLS manifest loaded.",
      "Quality levels:",
      data.levels.length
    );

    hideOverlay();

    // Try autoplay
    video.play().catch(() => {

      console.log(
        "Autoplay blocked. User can press Play."
      );

    });

  });


  // ========================================
  // MEDIA ATTACHED
  // ========================================

  hls.on(Hls.Events.MEDIA_ATTACHED, function () {

    console.log("HLS media attached.");

  });


  // ========================================
  // ERROR HANDLING
  // ========================================

  hls.on(Hls.Events.ERROR, function (event, data) {

    console.error("HLS ERROR:", data);

    if (!data.fatal) {
      return;
    }


    // Network error
    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {

      console.log(
        "Fatal network error. Restarting HLS loading..."
      );

      showWaiting("Reconnecting to live stream...");

      hls.startLoad();

      return;
    }


    // Media error
    if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {

      console.log(
        "Fatal media error. Recovering player..."
      );

      showWaiting("Recovering live stream...");

      hls.recoverMediaError();

      return;
    }


    // Unknown fatal error
    console.error(
      "Unrecoverable HLS error."
    );

    showWaiting("Stream unavailable.");

  });


  // ========================================
  // VIDEO EVENTS
  // ========================================

  video.addEventListener("playing", function () {

    console.log("▶ Video playing");

    hideOverlay();

  });


  video.addEventListener("waiting", function () {

    console.log("⏳ Video waiting / buffering");

  });


  video.addEventListener("stalled", function () {

    console.log("⚠ Video stalled");

  });


  video.addEventListener("canplay", function () {

    console.log("✅ Video can play");

  });


}
else if (
  video.canPlayType("application/vnd.apple.mpegurl")
) {

  // ========================================
  // NATIVE HLS
  // ========================================

  console.log("Using native HLS.");

  video.src = STREAM_URL;

  video.addEventListener(
    "loadedmetadata",
    function () {

      hideOverlay();

      video.play().catch(() => {

        console.log(
          "Autoplay blocked. Press Play."
        );

      });

    }
  );

}
else {

  showWaiting(
    "This browser does not support HLS playback."
  );

}
