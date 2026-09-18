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


// ===============================
// OVERLAY FUNCTIONS
// ===============================
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


// ===============================
// CHECK VIDEO ELEMENT
// ===============================
if (!video) {
  console.error("Video element #player was not found.");
  showWaiting("Video player not found.");
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
try {
  firebase.initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const database = firebase.database();


// ===============================
// LIVE VIEWER COUNT
// ===============================
const viewerCountElement =
  document.getElementById("viewerCount");

if (database) {
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
}


// ===============================
// HLS PLAYER
// ===============================
if (video) {

  if (
    !STREAM_URL ||
    STREAM_URL.includes("PASTE_PUBLIC")
  ) {

    showWaiting(
      "Add your public HLS stream URL in app.js"
    );

  }

  // =============================
  // HLS.JS
  // =============================
  else if (
    window.Hls &&
    Hls.isSupported()
  ) {

    const hls = new Hls({

      // Worker
      enableWorker: true,

      // Stability over ultra-low latency
      lowLatencyMode: false,

      // Start with a few live segments
      initialLiveManifestSize: 3,

      // Stay a little behind live edge
      liveSyncDurationCount: 4,
      liveMaxLatencyDurationCount: 10,

      // Buffer
      maxBufferLength: 30,
      maxMaxBufferLength: 60,

      // Back buffer
      backBufferLength: 30,

      // Small segment gaps
      maxBufferHole: 0.5

    });


    // =============================
    // LOAD HLS
    // =============================
    hls.loadSource(STREAM_URL);

    hls.attachMedia(video);


    // =============================
    // MEDIA ATTACHED
    // =============================
    hls.on(
      Hls.Events.MEDIA_ATTACHED,
      () => {

        console.log(
          "HLS media attached."
        );

      }
    );


    // =============================
    // MANIFEST LOADED
    // =============================
    hls.on(
      Hls.Events.MANIFEST_PARSED,
      (event, data) => {

        console.log(
          "HLS manifest loaded."
        );

        console.log(
          "Quality levels:",
          data.levels.length
        );

        hideOverlay();

        video
          .play()
          .catch(() => {

            console.log(
              "Autoplay blocked. Press Play."
            );

          });

      }
    );


    // =============================
    // HLS ERROR HANDLING
    // =============================
    hls.on(
      Hls.Events.ERROR,
      (event, data) => {

        console.warn(
          "HLS ERROR:",
          data.type,
          data.details,
          "fatal:",
          data.fatal
        );


        // -------------------------
        // Non-fatal error
        // -------------------------
        if (!data.fatal) {
          return;
        }


        // -------------------------
        // Network error
        // -------------------------
        if (
          data.type ===
          Hls.ErrorTypes.NETWORK_ERROR
        ) {

          console.log(
            "Network error. Retrying..."
          );

          showWaiting(
            "Reconnecting to live stream..."
          );

          hls.startLoad();

          return;
        }


        // -------------------------
        // Media error
        // -------------------------
        if (
          data.type ===
          Hls.ErrorTypes.MEDIA_ERROR
        ) {

          console.log(
            "Media error. Recovering..."
          );

          hls.recoverMediaError();

          return;
        }


        // -------------------------
        // Other fatal error
        // -------------------------
        console.error(
          "Fatal HLS error:",
          data
        );

        showWaiting(
          "Stream unavailable. Please try again."
        );

      }
    );


    // =============================
    // VIDEO WAITING
    // =============================
    video.addEventListener(
      "waiting",
      () => {

        console.log(
          "Video waiting for data..."
        );

      }
    );


    // =============================
    // VIDEO PLAYING
    // =============================
    video.addEventListener(
      "playing",
      () => {

        console.log(
          "Live stream playing."
        );

        hideOverlay();

      }
    );


    // =============================
    // VIDEO STALLED
    // =============================
    video.addEventListener(
      "stalled",
      () => {

        console.log(
          "Video stalled."
        );

      }
    );

  }


  // =============================
  // NATIVE HLS
  // =============================
  else if (
    video.canPlayType(
      "application/vnd.apple.mpegurl"
    )
  ) {

    console.log(
      "Using native HLS playback."
    );

    video.src = STREAM_URL;


    video.addEventListener(
      "loadedmetadata",
      () => {

        hideOverlay();

        video
          .play()
          .catch(() => {

            console.log(
              "Autoplay blocked. Press Play."
            );

          });

      }
    );

  }


  // =============================
  // HLS NOT SUPPORTED
  // =============================
  else {

    showWaiting(
      "This browser does not support HLS playback."
    );

  }

}
