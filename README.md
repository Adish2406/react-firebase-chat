

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.


# 💬 Real-Time Chat Application

A real-time chat application built with **React** and **Firebase** that enables users to communicate instantly. This app supports user authentication, real-time message syncing, and a responsive UI.

## 🚀 Features

- 🔐 Firebase Authentication (Email/Password or Google Sign-In)
- 💬 Real-time messaging using Firebase Firestore
- 🧑‍🤝‍🧑 Online/Offline status indicator
- 📱 Responsive and mobile-friendly design

2.Install Dependencies
Make sure you have Node.js installed. Then run:
npm install

---

## 🛠️ Setup Instructions

### 1. Clone the Repository

git clone https://github.com/n-ananya/react-firebase-chat.git
cd react-firebase-chat


3. Firebase Configuration
Go to Firebase Console.

Create a new project.

Enable Authentication (Email/Password or Google Sign-In).

Enable Cloud Firestore.

Go to Project Settings > General > Add App (Web).

Copy the Firebase config and replace the contents of firebase.js or .env file:

4. Run the Application

npm start
