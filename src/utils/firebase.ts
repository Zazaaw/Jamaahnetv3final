import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBqmZ6G_7SoMJUhQFd6LeBLUEnhl-zHCPc",
  authDomain: "jamaahnet.firebaseapp.com",
  projectId: "jamaahnet",
  storageBucket: "jamaahnet.firebasestorage.app",
  messagingSenderId: "518685266898",
  appId: "1:518685266898:web:6c55f0b4e33fb1eb6a6e0b",
  measurementId: "G-6N81WG7N4C"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Fungsi untuk minta izin & ambil token
export const requestForToken = async (userId: string, savePushToken: Function) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: "BM5stiqe-qFQjHlUAX0B8Gw84NQlU9RHSVjLL2CupbU-gZXdYwmoL62qJXnxKEzvfsYavra9BJOYk-cmAQa3DFs" 
      });
      if (token) {
        await savePushToken(userId, token);
        console.log('Token nangkring wak:', token);
      }
    }
  } catch (err) {
    console.error('Gagal ambil token:', err);
  }
};