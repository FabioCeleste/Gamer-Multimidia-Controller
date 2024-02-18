document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("connectButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "connect" });
  });

  document.getElementById("disconnectButton").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "disconnect" });
  });
});
