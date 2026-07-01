$(function() {
    // Config page logic

    const $btnSelectMusic = $('#btn-select-music');
    const $selectedMusicName = $('#selected-music-name');
    const $songTitle = $('#song-title');
    const $songAuthor = $('#song-author');
    const $chkUseExtracted = $('#chk-use-extracted');
    const $chkPreviewSong = $('#chk-preview-song');
    const $extractedAuthor = $('#extracted-author');
    const $extractedTitle = $('#extracted-title');
    const $extractedDuration = $('#extracted-duration');
    const $coverImage = $('#cover-image');
    const $coverImageContainer = $('#cover-image-container');
    const $fileCustomCover = $('#file-custom-cover');

    let currentMusicFile = null;
    let extractedMetadata = null;

    $btnSelectMusic.on('click', async () => {
        // We need an IPC call to open file dialog and extract metadata
        // For now, assume window.electron.selectAudioFile() exists
        if (window.electron && window.electron.selectAudioFile) {
            const result = await window.electron.selectAudioFile();
            if (result && result.filePath) {
                currentMusicFile = result.filePath;
                $selectedMusicName.text(result.fileName);
                
                // Update metadata
                extractedMetadata = result.metadata;
                
                if (extractedMetadata) {
                    $extractedTitle.text(extractedMetadata.title || "No Title Found");
                    $extractedAuthor.text(extractedMetadata.artist || "No Author Found");
                    $extractedDuration.text((extractedMetadata.duration || "0.00") + " Seconds");
                    
                    if (extractedMetadata.coverPath) {
                        $coverImage.attr('src', extractedMetadata.coverPath + "?t=" + new Date().getTime());
                    } else {
                        $coverImage.attr('src', '../images_original/SmallCustomCassetteTemplate.png');
                    }
                    
                    if (extractedMetadata.title && extractedMetadata.artist) {
                        $chkUseExtracted.prop('disabled', false);
                    } else {
                        $chkUseExtracted.prop('disabled', true);
                        $chkUseExtracted.prop('checked', false);
                    }
                }
                
                $songTitle.prop('disabled', false);
                $songAuthor.prop('disabled', false);
                $chkPreviewSong.prop('disabled', false);
            }
        }
    });

    $chkUseExtracted.on('change', function() {
        if ($(this).is(':checked')) {
            $songTitle.val($extractedTitle.text());
            $songAuthor.val($extractedAuthor.text());
            $songTitle.prop('disabled', true);
            $songAuthor.prop('disabled', true);
        } else {
            $songTitle.prop('disabled', false);
            $songAuthor.prop('disabled', false);
        }
    });

    // Custom Cover Image Logic (TODO: change the cover image by clicking the album cover)
    $coverImageContainer.on('click', () => {
        $fileCustomCover.trigger('click');
    });

    $fileCustomCover.on('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                $coverImage.attr('src', e.target.result);
                // We would also need to save this to the backend or keep track of the path
                // For now, it just shows up in the UI.
            }
            
            reader.readAsDataURL(file);
        }
    });
});
