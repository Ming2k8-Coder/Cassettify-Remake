# Cassettify Remake 📼

A fully-featured, cross-platform custom cassette creator for the game **ROBOBEAT**. 

This is a ground-up remake of the original Cassettify project built using Electron. It aims to provide a massively improved user experience, better format support, and far more accurate beat detection for importing your custom music into ROBOBEAT.

*Note: This project is currently a Work In Progress (WIP) and is public to make development progress visible.*

## ✨ Key Features
*   **Ultimate Format Support:** Import `.flac`, `.mp3`, `.ogg`, and `.wav` files effortlessly.
*   **Custom Cassette Covers:** Personalize your in-game cassettes by applying your own custom album covers and adjusting visual parameters (rotation, color settings, stickers).
*   **Advanced Dynamic BPM Detection:** Utilizes the robust Essentia streaming beat tracker for hyper-accurate rhythm detection, ensuring your music syncs perfectly with ROBOBEAT's gameplay mechanics.
*   **3D Visualizer:** Preview your custom cassette creations with an interactive 3D UI before exporting.
*   **Batch Processing:** Drag and drop multiple songs into the library to process them simultaneously.

## 🚀 Getting Started (Development)

Since this project is currently in development, you can run it locally using Node.js and Electron:

1. Clone this repository:
   ```bash
   git clone https://github.com/roboltz/Cassettify-Remake.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the application:
   ```bash
   npm start
   ```

## 🛠️ Tech Stack
*   **Frontend:** HTML, CSS, JavaScript (jQuery)
*   **Backend:** Electron (Node.js)
*   **Audio Processing:** FFmpeg & FFprobe
*   **Beat Tracking:** Essentia (`essentia_streaming_beattracker_multifeature`)

## 🙏 Credits & Acknowledgments
*   Huge thanks to **miaulyn** for helping add better, high-quality cassette textures to the project!
