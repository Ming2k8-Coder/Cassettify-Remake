$(function() {
    const $songTitle = $('#song-title');
    const $songAuthor = $('#song-author');

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



    // ── Public: called from home.js openConfigForCassette ─────────
    // (home.js sets window.currentCassetteUUID then calls this)
    window.refreshConfigPage = function() {
        if (!window.currentCassetteUUID) return;
        const data = window.cassetteData?.find(c => c.UUID === window.currentCassetteUUID);
        if (!data) return;

        $songTitle.val(data.title  || '');
        $songAuthor.val(data.artist || '');
    };
});
