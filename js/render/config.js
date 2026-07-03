$(function() {
    const $songTitle = $('#song-title');
    const $songAuthor = $('#song-author');
    const $coverImage = $('#cover-image');
    const $coverImageContainer = $('#cover-image-container');
    const $fileCustomCover = $('#file-custom-cover');
    const $videoFramePicker = $('#video-frame-picker');
    const $frameTimeInput = $('#frame-time-input');
    const $btnExtractFrame = $('#btn-extract-frame');

    // ── Debounce helper ────────────────────────────────────────────
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // ── Auto-save title/artist ─────────────────────────────────────
    const saveMetadata = debounce(async () => {
        if (!window.currentCassetteUUID) return;
        const updatedData = {
            title:  $songTitle.val(),
            artist: $songAuthor.val()
        };
        await window.metadata.saveCassetteData(window.currentCassetteUUID, updatedData);

        // Also keep the in-memory array in sync so the home list reflects the change
        const activeCassette = window.cassetteData?.find(c => c.UUID === window.currentCassetteUUID);
        if (activeCassette) {
            activeCassette.title  = updatedData.title;
            activeCassette.artist = updatedData.artist;
        }
    }, 500);

    $songTitle.on('input', saveMetadata);
    $songAuthor.on('input', saveMetadata);

    // ── Custom cover image via click ───────────────────────────────
    $coverImageContainer.on('click', () => $fileCustomCover.trigger('click'));

    $fileCustomCover.on('change', async function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = async function(ev) {
                $coverImage.attr('src', ev.target.result);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // ── Video frame picker ─────────────────────────────────────────
    $btnExtractFrame.on('click', async () => {
        if (!window.currentCassetteUUID) return;

        const data = window.cassetteData?.find(c => c.UUID === window.currentCassetteUUID);
        if (!data) return;

        const frameTimeSec = parseFloat($frameTimeInput.val() || 0);
        // Build the original audio path
        const originalFilePath = `cassettes/${data.UUID}/originalAudio/${data.filename}`;

        $btnExtractFrame.prop('disabled', true).text('Extracting…');

        const result = await window.metadata.reextractCover(
            window.currentCassetteUUID,
            originalFilePath,
            frameTimeSec
        );

        if (result && result.success) {
            // Update the cover image preview with a cache-busting query
            $coverImage.attr('src', `../cassetteAlbumCovers/${result.coverHash}.jpg?t=${Date.now()}`);
            // Keep in-memory data up to date
            if (data) data.coverHash = result.coverHash;
        } else {
            alert('Could not extract frame: ' + (result?.error || 'Unknown error'));
        }

        $btnExtractFrame.prop('disabled', false).text('Extract Frame');
    });

    // ── Public: called from home.js openConfigForCassette ─────────
    // (home.js sets window.currentCassetteUUID then calls this)
    window.refreshConfigPage = function() {
        if (!window.currentCassetteUUID) return;
        const data = window.cassetteData?.find(c => c.UUID === window.currentCassetteUUID);
        if (!data) return;

        $songTitle.val(data.title  || '');
        $songAuthor.val(data.artist || '');

        const coverSrc = data.coverHash
            ? `../cassetteAlbumCovers/${data.coverHash}.jpg`
            : '../images_original/SmallCustomCassetteTemplate.png';
        $coverImage.attr('src', coverSrc);

        // Show/hide the video frame picker
        if (data.isVideo) {
            $videoFramePicker.show();
            $frameTimeInput.val(data.frameTimeSec || 0);
        } else {
            $videoFramePicker.hide();
        }
    };
});
