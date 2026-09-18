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

// ==========================================
// SIMULATED VIEWER DISPLAY
// ==========================================

const viewerCountElement =
  document.getElementById("viewerCount");

const totalViewersElement =
  document.getElementById("totalViewers");


// Starting values
let liveWatching = 4200;
let totalViewers = 20000;


// Random number helper
function randomBetween(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}


// Format numbers: 4200 -> 4,200
function formatNumber(number) {
  return number.toLocaleString("en-IN");
}


// Update display
function updateViewerDisplay() {

  if (viewerCountElement) {
    viewerCountElement.textContent =
      `👁 ${formatNumber(liveWatching)} Watching`;
  }

  if (totalViewersElement) {
    totalViewersElement.textContent =
      `👥 ${formatNumber(totalViewers)} Total`;
  }

}


// ==========================================
// LIVE WATCHING: 3,200 - 8,000
// Changes every 4 seconds
// ==========================================

setInterval(() => {

  liveWatching = randomBetween(3200, 8000);

  updateViewerDisplay();

}, 4000);


// ==========================================
// TOTAL VIEWERS: 20,000 - 80,000
// Gradually increases
// ==========================================

setInterval(() => {

  if (totalViewers < 80000) {

    // Increase by 50-350
    totalViewers += randomBetween(50, 350);

    // Never exceed 80,000
    totalViewers =
      Math.min(totalViewers, 80000);

    updateViewerDisplay();

  }

}, 7000);


// Initial display
updateViewerDisplay();
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
