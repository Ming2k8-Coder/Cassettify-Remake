# Cassettify to Cassettify-Remake (Electron) Port Plan

## Phase 1: Setup and Assets Migration
- [x] Clone `images`, `font`, `ffmpeg`, `beat_finder`, etc. from the original Cassettify project.
- [x] Set up the basic Electron `main.js` and IPC handlers to match the Python backend features (e.g. metadata extraction, ffmpeg integration).
- [x] Adapt CSS/UI to match the CustomTkinter style from the original.

## Phase 2: Core UI & Homepage TODOs
- [x] Implement the scrollable list of uploaded songs.
- [x] **TODO: Add feature drag and drop to list (for uploading songs)**.
- [ ] Add the 3D cassette viewer.
- [x] **TODO: Make a loading screen to be shown when doing long processes** (like extracting song metadata).

## Phase 3: Configuration & Visuals TODOs
- [x] **TODO: Allow changing the cover image by clicking the album cover.** (UI Done)
- [ ] Port configuration logic (Backend/IPC).
- [ ] **TODO: Easier adjustment for cassette visuals, non-1:1 image support, rotation, color settings, stickers.**

## Phase 4: Track, Export, Settings TODOs
- [ ] **TODO: BPM detection, ticker sound, waveform generation.**
- [ ] **TODO: Export popup, checklist, multiple formats.**
- [ ] **TODO: Settings page (themes, auto-actions, reset data).**
