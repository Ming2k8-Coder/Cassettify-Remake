$(function() {
    const $songTitle = $('#song-title');
    const $songAuthor = $('#song-author');
    const $chkUseExtracted = $('#chk-use-extracted');
    const $coverImage = $('#cover-image');
    const $coverImageContainer = $('#cover-image-container');
    const $fileCustomCover = $('#file-custom-cover');

    // Debounce function to prevent spamming saves
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    const saveMetadata = debounce(async () => {
        if (!window.currentCassetteUUID) return;
        
        const updatedData = {
            title: $songTitle.val(),
            artist: $songAuthor.val()
        };
        
        await window.metadata.saveCassetteData(window.currentCassetteUUID, updatedData);
        // Also update the global array in home.js so the UI stays in sync without reloading
        const activeCassette = window.cassetteData?.find(c => c.UUID === window.currentCassetteUUID);
        if (activeCassette) {
            activeCassette.title = updatedData.title;
            activeCassette.artist = updatedData.artist;
        }
    }, 500);

    $songTitle.on('input', saveMetadata);
    $songAuthor.on('input', saveMetadata);

    // Custom Cover Image Logic
    $coverImageContainer.on('click', () => {
        $fileCustomCover.trigger('click');
    });

    $fileCustomCover.on('change', async function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = async function(e) {
                $coverImage.attr('src', e.target.result);
                // Currently, we don't save the custom cover directly via IPC yet, 
                // but we would send the file buffer to main.js and overwrite the hash.
            }
            
            reader.readAsDataURL(file);
        }
    });
});
