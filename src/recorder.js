// src/recorder.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

// Read video title from URL parameter; default to "Recording"
const urlParams = new URLSearchParams(window.location.search);
const videoNameParam = urlParams.get("videoName") || "Recording";

// Firebase configuration (you can also use environment variables)
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

// Get DOM elements
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const screenPreview = document.getElementById("screenPreview");
const webcamPreview = document.getElementById("webcamPreview");
const recorderUI = document.getElementById("recorderUI");

let mediaRecorder;
let recordedChunks = [];
let screenStream;
let webcamStream;

startBtn.addEventListener("click", async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  try {
    // Hide the recorder UI so it isn't captured
    if (recorderUI) recorderUI.style.display = "none";

    // Request screen capture (this will trigger the built-in screen–share prompt in a full-page window)
    screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });
    screenStream.getTracks().forEach((track) => {
      track.addEventListener("ended", stopRecording);
    });
    // Request webcam capture for overlay.
    webcamStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 200, height: 150 },
      audio: false,
    });
    webcamPreview.srcObject = webcamStream;
    screenPreview.srcObject = screenStream;
    // Combine the screen and webcam streams.
    const combinedStream = new MediaStream([
      ...screenStream.getTracks(),
      ...webcamStream.getVideoTracks(),
    ]);
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm",
    });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };
    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      // Optionally, display a preview (this preview will show the recorded video without the UI)
      screenPreview.src = URL.createObjectURL(blob);
      // Upload the video to Firebase using the provided video title.
      await uploadVideo(blob, videoNameParam);
      // Optionally, close the recorder window after a short delay.
      setTimeout(() => window.close(), 3000);
    };
    mediaRecorder.start();
  } catch (err) {
    console.error("Error starting recording:", err);
    alert("Error starting recording: " + err.message);
  }
});

stopBtn.addEventListener("click", () => {
  stopRecording();
});

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
  if (screenStream) screenStream.getTracks().forEach((track) => track.stop());
  if (webcamStream) webcamStream.getTracks().forEach((track) => track.stop());
  startBtn.disabled = false;
  stopBtn.disabled = true;
  // Optionally restore the recorder UI if you want it visible after recording.
  if (recorderUI) recorderUI.style.display = "block";
}

async function uploadVideo(blob, videoName) {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert("User not authenticated. Please log in.");
      return;
    }
    const uniqueFileName = `${videoName}`;
    const videoStoragePath = `videos/${user.uid}/${uniqueFileName}`;
    const storageRefInstance = storageRef(storage, videoStoragePath);
    const uploadTask = uploadBytesResumable(storageRefInstance, blob);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload progress:", Math.floor(progress));
      },
      (error) => {
        console.error("Upload failed:", error);
        alert("Upload failed: " + error.message);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "users", user.uid, "videos"), {
          videoName,
          downloadURL,
          uploadedAt: serverTimestamp(),
        });
        alert("Video uploaded successfully!");
      }
    );
  } catch (err) {
    console.error("Error during upload:", err);
    alert("An error occurred during upload: " + err.message);
  }
}
