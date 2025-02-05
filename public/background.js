// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'UPLOAD_VIDEO') {
    // Ensure the offscreen document exists.
    chrome.offscreen
      .createDocument({
        url: 'offscreen.html',
        reasons: ['BLOBS'],
        justification: 'Upload video recording'
      })
      .catch(err => {
        console.log("Offscreen document already exists or error:", err);
      });
    // The offscreen document (offscreen.js) will handle the upload.
  }
});
