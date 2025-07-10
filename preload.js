console.log("preload start");
const { contextBridge, ipcRenderer } = require("electron");
try {
  contextBridge.exposeInMainWorld("electronAPI", {
    setCustomWindowSize: (size) =>
      ipcRenderer.invoke("set-custom-window-size", size),
  });
  console.log("contextBridge exposeInMainWorld 성공");
} catch (e) {
  console.error("contextBridge exposeInMainWorld 실패", e);
}
console.log("preload loaded");
console.log(
  "window.electronAPI in preload:",
  typeof window.electronAPI,
  window.electronAPI
);
