let webSocket = null;
let keepAliveIntervalId = null;
const TEN_SECONDS_MS = 20 * 1000;

fetch("https://chrome-extension-websockets.glitch.me/", { mode: "no-cors" });

function connect() {
  webSocket = new WebSocket("ws://localhost:1337");

  webSocket.onopen = (event) => {
    console.log("open connection");
  };

  webSocket.onmessage = async (event) => {
    const activeTab = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const respObj = JSON.parse(event.data);

    switch (respObj.function) {
      case "play":
        chrome.scripting.executeScript({
          target: { tabId: activeTab[0].id },

          function: () => {
            const elements = document.getElementsByTagName("video");

            if (elements[0].paused) {
              elements[0].play();
            } else {
              elements[0].pause();
            }

            chrome.runtime.sendMessage({
              type: "updateVideoStatus",
              videoStatus: elements[0].paused,
            });
          },
        });
        break;

      case "previous":
        chrome.scripting.executeScript({
          target: { tabId: activeTab[0].id },

          function: () => {
            history.back();
          },
        });
        break;

      case "next":
        chrome.scripting.executeScript({
          target: { tabId: activeTab[0].id },

          function: () => {
            const elements = document.getElementsByTagName("video");
            elements[0].currentTime = elements[0].duration;
          },
        });
        break;
    }
  };

  webSocket.onclose = (event) => {
    console.log("websocket connection closed");
    webSocket = null;
  };
}

function keepAlive() {
  keepAliveIntervalId = setInterval(
    () => {
      if (webSocket) {
        webSocket.send(JSON.stringify({ ping: "ping" }));
      } else {
        clearInterval(keepAliveIntervalId);
      }
    },

    TEN_SECONDS_MS
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "connect") {
    connect();
    keepAlive();
  } else if (message.type === "disconnect") {
    webSocket.close();
    clearInterval(keepAliveIntervalId);
  }

  if (message.type === "updateVideoStatus") {
    webSocket.send(
      JSON.stringify({
        videoStatus: message.videoStatus,
        updateIcon: true,
      })
    );
  }
});
