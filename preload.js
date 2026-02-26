const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  sendApprovalEvent(type, confidence) {
    ipcRenderer.send('approval-event', { type, confidence });
  }
});
