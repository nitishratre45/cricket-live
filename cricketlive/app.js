// Put your PUBLIC HLS URL here.
// Example: http://YOUR-SERVER:8888/live/index.m3u8
const STREAM_URL = "PASTE_PUBLIC_HLS_URL_HERE";

const video = document.getElementById("player");
const overlay = document.getElementById("overlay");
const message = document.getElementById("message");

function hideOverlay(){ overlay.classList.add("hidden"); }
function showWaiting(text){ message.textContent=text; overlay.classList.remove("hidden"); }

if (!STREAM_URL || STREAM_URL.includes("PASTE_PUBLIC")) {
  showWaiting("Add your public HLS stream URL in app.js");
} else if (window.Hls && Hls.isSupported()) {
  const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
  hls.loadSource(STREAM_URL);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, () => hideOverlay());
  hls.on(Hls.Events.ERROR, (_, data) => {
    if (data.fatal) showWaiting("Stream unavailable. Check the stream URL.");
  });
} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
  video.src = STREAM_URL;
  video.addEventListener("loadedmetadata", hideOverlay);
} else {
  showWaiting("This browser does not support HLS playback.");
}
