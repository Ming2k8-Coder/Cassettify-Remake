# Cassettify to Cassettify-Remake (Electron) Port Plan

## Phase 1: Setup and Assets Migration
- [x] Clone `images`, `font`, `ffmpeg`, `beat_finder`, etc. from the original Cassettify project.
- [x] Set up the basic Electron `main.js` and IPC handlers to match the Python backend features (e.g. metadata extraction, ffmpeg integration).
- [x] Adapt CSS/UI to match the CustomTkinter style from the original.

## Phase 2: Core UI & Homepage TODOs
- [x] Implement the scrollable list of uploaded songs.
- [x] **TODO: Add feature drag and drop to list (for uploading songs)**.
- [x] Add the 3D cassette viewer.
- [x] **TODO: Make a loading screen to be shown when doing long processes** (like extracting song metadata).

## Phase 3: Configuration & Visuals TODOs
- [x] **TODO: Allow changing the cover image by clicking the album cover.** (UI Done)
- [x] Port configuration logic (Backend/IPC).
- [x] **TODO: Easier adjustment for cassette visuals, non-1:1 image support, rotation, color settings, stickers.**
- [x] **NEW:** Integrate `node-vibrant` for Smart Palette Extraction to auto-fill cassette and label colors based on the album art.
- [x] **NEW:** Enhance the 3D Viewer to reflect color, pattern, and J-card changes in real-time.

## Phase 4: Track, Export, Settings TODOs
- [x] **TODO: BPM detection, ticker sound, waveform generation.**
- [x] **NEW:** Build an Interactive Waveform Editor using `wavesurfer.js` with draggable beat markers and grid snapping.
- [x] **NEW:** Add Web Audio API beat tick previewer to test detection accuracy in-app.
- [x] **NEW:** Implement Constant BPM Mode (ArrowVortex style) & Global Offset calculation to prevent mid-song desyncs.
- [x] **NEW:** Add BPM Range Target Filter to prevent half-time/double-time detection errors.
## Phase 4.5: Export & Settings TODOs
- [x] **Export checklist & UI:** Export popup, checklist, multiple formats.
  - [ ] **TODO:** Make export a popup that shows in front of the current page instead of swapping the page.
  - [ ] **TODO:** Allow the user to export in any format.
  - [ ] **TODO:** Show a checklist for required things before exporting.
- [ ] **TODO:** Settings page (allow user to configure font, dark/light mode or system, configure auto-actions like metadata extraction, and reset button to wipe all user data like cassettes/visuals position settings).

## Phase 5: Core Performance Optimizations (NEW)
- [ ] Implement Worker Threads for heavy algorithms (parsing beat arrays, generating waveforms) to ensure 60FPS UI.
- [ ] Implement Non-blocking Audio Piping (Node.js Streams + fluent-ffmpeg) to build the `.robobeat` file in memory, reducing SSD wear and speeding up exports.

## Phase Bug: Bug Fixes & UX Polish (Newly Reported)
- [ ] **Home Page Fixes:**
  - [ ] Fix div failure/text overflow for long file names in song lists and the bottom bar.
  - [ ] Fix the Home 3D cassette view rendering oversize.
  - [ ] **TODO:** Make a loading screen to be shown when doing long processes like extracting song metadata.
- [ ] **Config & Visuals:**
  - [ ] Fix config page failing to properly load the file imported/selected from the home tab.
  - [ ] Overhaul Visuals page: remove/move the "change cover" option from Config over to Visuals.
  - [ ] **TODO:** Implement the Visuals features: easier adjustment, support non-1:1 images, rotation, color setting, stickers (custom images anywhere on the front), apply global position settings for specific images.
- [ ] **Track Page:**
  - [ ] Fix track page failing to select the active file.
  - [ ] Add visual and audio beat indicators (metronome/gunshot/etc. that are configurable).
- [ ] **Global UI:**
  - [ ] Remove the bottom music player bar (overlaps with functionality in the Track tab).
