// src/offscreen.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// You can obtain these values from your environment variables or hard-code for testing.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'UPLOAD_VIDEO') {
    console.log("Offscreen received UPLOAD_VIDEO for:", request.videoName);
    // Reconstruct the Blob from the transmitted array.
    const blob = new Blob([new Uint8Array(request.blob)], { type: 'video/webm' });
    uploadVideo(blob, request.videoName);
  }
});

async function uploadVideo(blob, videoName) {
  try {
    if (!auth.currentUser) {
      throw new Error('User not authenticated');
    }
    const user = auth.currentUser;
    console.log("User authenticated:", user.uid);
    const storageRefInstance = storageRef(storage, `videos/${user.uid}/${videoName}-${Date.now()}.webm`);
    const uploadTask = uploadBytesResumable(storageRefInstance, blob);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        chrome.runtime.sendMessage({ action: 'UPLOAD_PROGRESS', progress: Math.round(progress) });
      },
      (error) => {
        chrome.runtime.sendMessage({ action: 'UPLOAD_ERROR', error: error.message });
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'users', user.uid, 'videos'), {
          videoName,
          downloadURL,
          timestamp: serverTimestamp()
        });
        chrome.runtime.sendMessage({ action: 'UPLOAD_COMPLETE' });
        chrome.offscreen.closeDocument();
      }
    );
  } catch (error) {
    console.error("Error in uploadVideo:", error);
    chrome.runtime.sendMessage({ action: 'UPLOAD_ERROR', error: error.message });
    chrome.offscreen.closeDocument();
  }
}
