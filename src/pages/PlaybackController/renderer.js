let ws;

const playSvg = "../../assets/svgs/play.svg";
const pauseSvg = "../../assets/svgs/pause.svg";

const playImgTag = document.getElementById("play-pause-btn-icon");
let isPlaying = true;

function connectWebSocket() {
  ws = new WebSocket("ws://localhost:1337");

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    const respObj = JSON.parse(event.data);

    if (respObj.updateIcon) {
      if (!respObj.videoStatus) {
        playImgTag.src = pauseSvg;
      } else {
        playImgTag.src = playSvg;
      }
    }

    console.log("Received message:", event.data);
  };

  ws.onclose = () => {
    setTimeout(connectWebSocket, 5000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

document.getElementById("play-pause-btn").addEventListener("click", (event) => {
  ws.send(JSON.stringify({ function: "play" }));
});

document.getElementById("previous-btn").addEventListener("click", (event) => {
  ws.send(JSON.stringify({ function: "previous" }));
});

document.getElementById("next-btn").addEventListener("click", (event) => {
  ws.send(JSON.stringify({ function: "next" }));
});

connectWebSocket();
