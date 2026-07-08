$(function() {
    const $cassetteColor = $('#cassette-color');
    const $labelColor = $('#label-color');
    const $patternSelect = $('#pattern-select');
    const $palettePreview = $('#palette-preview');
    const $previewCassette = $('#preview-cassette-template');

    const $coverImage = $('#cover-image');
    const $coverImageContainer = $('#cover-image-container');
    const $fileCustomCover = $('#file-custom-cover');
    const $videoFramePicker = $('#video-frame-picker');
    const $frameTimeInput = $('#frame-time-input');
    const $btnExtractFrame = $('#btn-extract-frame');

    // Visual elements inside the 3D model preview
    const $visualsCoverImage = $('#visuals-cover-image');
    const $visualsStickersContainer = $('#visuals-stickers-container');

    // Alignment Slider Controls
    const $coverScaleX = $('#cover-scale-x');
    const $coverScaleY = $('#cover-scale-y');
    const $coverOffsetX = $('#cover-offset-x');
    const $coverOffsetY = $('#cover-offset-y');
    const $coverRotation = $('#cover-rotation');

    // Sticker Controls
    const $btnAddSticker = $('#btn-add-sticker');
    const $btnClearStickers = $('#btn-clear-stickers');
    const $fileStickerUpload = $('#file-sticker-upload');
    const $stickersControlList = $('#stickers-control-list');

    let stickersList = [];

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    const saveVisuals = debounce(async () => {
        if (!window.currentCassetteUUID) return;
        
        const updatedData = {
            visuals: {
                CassetteTextureInternalName: $patternSelect.val(),
                CassetteColor: hexToNormalizedRGB($cassetteColor.val()),
                LabelColor: hexToNormalizedRGB($labelColor.val()),
                CoverScaleX: parseInt($coverScaleX.val()),
                CoverScaleY: parseInt($coverScaleY.val()),
                CoverOffsetX: parseInt($coverOffsetX.val()),
                CoverOffsetY: parseInt($coverOffsetY.val()),
                CoverRotation: parseInt($coverRotation.val()),
                Stickers: stickersList
            },
            hexColors: {
                cassette: $cassetteColor.val(),
                label: $labelColor.val()
            }
        };
        
        await window.metadata.saveCassetteData(window.currentCassetteUUID, updatedData);
        // Sync in-memory representation
        const data = window.cassetteData.find(c => c.UUID === window.currentCassetteUUID);
        if (data) {
            data.visuals = updatedData.visuals;
            data.hexColors = updatedData.hexColors;
        }
    }, 500);

    function hexToNormalizedRGB(hex) {
        hex = hex.replace('#', '');
        return {
            r: parseInt(hex.substring(0, 2), 16) / 255.0,
            g: parseInt(hex.substring(2, 4), 16) / 255.0,
            b: parseInt(hex.substring(4, 6), 16) / 255.0,
            a: 1.0
        };
    }
    
    function applyPreviewTint() {
        // Border matches cassette body color, background-color matches label color
        $previewCassette.css('border', `5px solid ${$cassetteColor.val()}`);
        $previewCassette.css('background-color', $labelColor.val());
    }

    function applyCoverAlignment() {
        const sx = $coverScaleX.val();
        const sy = $coverScaleY.val();
        const ox = $coverOffsetX.val();
        const oy = $coverOffsetY.val();
        const rot = $coverRotation.val();

        // The default template orientation is rotated -90 degrees, so we align our cover transformations with it
        const transformStr = `translate(-50%, -50%) translate(${ox}px, ${oy}px) rotate(${-90 + parseInt(rot)}deg) scale(${sx / 100}, ${sy / 100})`;
        $visualsCoverImage.css('transform', transformStr);
    }

    // Dynamic sticker rendering inside the 3D model
    function renderStickers() {
        $visualsStickersContainer.empty();
        $stickersControlList.empty();

        stickersList.forEach((s, index) => {
            // Add sticker element overlay inside 3D model
            const $stickerImg = $(`
                <img src="${s.src}" style="
                    position: absolute;
                    left: calc(50% + ${s.x}px);
                    top: calc(50% + ${s.y}px);
                    transform: translate(-50%, -50%) scale(${s.scale / 100});
                    width: 50px;
                    pointer-events: none;
                ">
            `);
            $visualsStickersContainer.append($stickerImg);

            // Add sticker control row in left panel
            const $ctrl = $(`
                <div class="sticker-control-item" style="border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 6px; background: rgba(0,0,0,0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="font-size:0.8em; font-weight:bold;">Sticker #${index + 1}</span>
                        <button class="btn-small btn-del-sticker" data-id="${s.id}" style="padding: 2px 6px; background: #ff4a4a; color: white; border: none; border-radius: 4px;">Delete</button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                        <div>
                            <label style="font-size: 0.75em; color: #888;">X Position</label>
                            <input type="range" class="sticker-slider-x" data-id="${s.id}" min="-150" max="150" value="${s.x}" style="width:100%;">
                        </div>
                        <div>
                            <label style="font-size: 0.75em; color: #888;">Y Position</label>
                            <input type="range" class="sticker-slider-y" data-id="${s.id}" min="-150" max="150" value="${s.y}" style="width:100%;">
                        </div>
                        <div style="grid-column: span 2;">
                            <label style="font-size: 0.75em; color: #888;">Scale (%)</label>
                            <input type="range" class="sticker-slider-scale" data-id="${s.id}" min="10" max="200" value="${s.scale}" style="width:100%;">
                        </div>
                    </div>
                </div>
            `);
            $stickersControlList.append($ctrl);
        });

        // Attach event listeners to newly rendered controls
        $('.btn-del-sticker').on('click', function() {
            const id = $(this).data('id');
            stickersList = stickersList.filter(s => s.id !== id);
            renderStickers();
            saveVisuals();
        });

        $('.sticker-slider-x').on('input', function() {
            const id = $(this).data('id');
            const val = parseInt($(this).val());
            const sticker = stickersList.find(s => s.id === id);
            if (sticker) {
                sticker.x = val;
                renderStickers();
                saveVisuals();
            }
        });

        $('.sticker-slider-y').on('input', function() {
            const id = $(this).data('id');
            const val = parseInt($(this).val());
            const sticker = stickersList.find(s => s.id === id);
            if (sticker) {
                sticker.y = val;
                renderStickers();
                saveVisuals();
            }
        });

        $('.sticker-slider-scale').on('input', function() {
            const id = $(this).data('id');
            const val = parseInt($(this).val());
            const sticker = stickersList.find(s => s.id === id);
            if (sticker) {
                sticker.scale = val;
                renderStickers();
                saveVisuals();
            }
        });
    }

    // Setup input change event listeners
    $cassetteColor.on('input', () => { applyPreviewTint(); saveVisuals(); });
    $labelColor.on('input', () => { applyPreviewTint(); saveVisuals(); });
    $patternSelect.on('change', saveVisuals);

    // Alignment changes
    $coverScaleX.on('input', () => { applyCoverAlignment(); saveVisuals(); });
    $coverScaleY.on('input', () => { applyCoverAlignment(); saveVisuals(); });
    $coverOffsetX.on('input', () => { applyCoverAlignment(); saveVisuals(); });
    $coverOffsetY.on('input', () => { applyCoverAlignment(); saveVisuals(); });
    $coverRotation.on('input', () => { applyCoverAlignment(); saveVisuals(); });

    $('#btn-reset-cover-align').on('click', () => {
        $coverScaleX.val(100);
        $coverScaleY.val(100);
        $coverOffsetX.val(0);
        $coverOffsetY.val(0);
        $coverRotation.val(0);
        applyCoverAlignment();
        saveVisuals();
    });

    $('#btn-save-global-align').on('click', () => {
        const alignSettings = {
            CoverScaleX: parseInt($coverScaleX.val()),
            CoverScaleY: parseInt($coverScaleY.val()),
            CoverOffsetX: parseInt($coverOffsetX.val()),
            CoverOffsetY: parseInt($coverOffsetY.val()),
            CoverRotation: parseInt($coverRotation.val())
        };
        localStorage.setItem('default-cover-align', JSON.stringify(alignSettings));
        alert('Alignment configuration saved as global default for future cassettes!');
    });

    // Sticker uploads
    $btnAddSticker.on('click', () => $fileStickerUpload.trigger('click'));
    $fileStickerUpload.on('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = function(ev) {
                const newSticker = {
                    id: 'sticker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
                    src: ev.target.result,
                    x: 0,
                    y: 0,
                    scale: 100
                };
                stickersList.push(newSticker);
                renderStickers();
                saveVisuals();
            };
            reader.readAsDataURL(e.target.files[0]);
        }
        $(this).val(''); // Clear target
    });

    $btnClearStickers.on('click', () => {
        if (confirm('Clear all stickers from this cassette?')) {
            stickersList = [];
            renderStickers();
            saveVisuals();
        }
    });

    // ── Custom cover image via click ───────────────────────────────
    $coverImageContainer.on('click', () => $fileCustomCover.trigger('click'));

    $fileCustomCover.on('change', async function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = async function(ev) {
                $coverImage.attr('src', ev.target.result);
                $visualsCoverImage.attr('src', ev.target.result).show();
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
            const freshSrc = `../cassetteAlbumCovers/${result.coverHash}.jpg?t=${Date.now()}`;
            $coverImage.attr('src', freshSrc);
            $visualsCoverImage.attr('src', freshSrc).show();
            if (data) data.coverHash = result.coverHash;
        } else {
            alert('Could not extract frame: ' + (result?.error || 'Unknown error'));
        }

        $btnExtractFrame.prop('disabled', false).text('Extract Frame');
    });

    // This function can be called when switching to the visuals page
    window.loadVisualsPage = function() {
        if (!window.currentCassetteUUID) return;
        const data = window.cassetteData.find(c => c.UUID === window.currentCassetteUUID);
        if (!data) return;
        
        if (data.hexColors) {
            $cassetteColor.val(data.hexColors.cassette || '#ffffff');
            $labelColor.val(data.hexColors.label || '#ffffff');
            applyPreviewTint();
        }
        if (data.visuals) {
            $patternSelect.val(data.visuals.CassetteTextureInternalName || 'DEFAULT');
            
            // Read cover alignment with localStorage global defaults as fallback
            const defaultAlignStr = localStorage.getItem('default-cover-align');
            const defaultAlign = defaultAlignStr ? JSON.parse(defaultAlignStr) : {};

            $coverScaleX.val(data.visuals.CoverScaleX ?? defaultAlign.CoverScaleX ?? 100);
            $coverScaleY.val(data.visuals.CoverScaleY ?? defaultAlign.CoverScaleY ?? 100);
            $coverOffsetX.val(data.visuals.CoverOffsetX ?? defaultAlign.CoverOffsetX ?? 0);
            $coverOffsetY.val(data.visuals.CoverOffsetY ?? defaultAlign.CoverOffsetY ?? 0);
            $coverRotation.val(data.visuals.CoverRotation ?? defaultAlign.CoverRotation ?? 0);
            
            stickersList = data.visuals.Stickers || [];
        } else {
            // Apply global default alignment
            const defaultAlignStr = localStorage.getItem('default-cover-align');
            if (defaultAlignStr) {
                const defaultAlign = JSON.parse(defaultAlignStr);
                $coverScaleX.val(defaultAlign.CoverScaleX);
                $coverScaleY.val(defaultAlign.CoverScaleY);
                $coverOffsetX.val(defaultAlign.CoverOffsetX);
                $coverOffsetY.val(defaultAlign.CoverOffsetY);
                $coverRotation.val(defaultAlign.CoverRotation);
            } else {
                $coverScaleX.val(100);
                $coverScaleY.val(100);
                $coverOffsetX.val(0);
                $coverOffsetY.val(0);
                $coverRotation.val(0);
            }
            stickersList = [];
        }

        applyCoverAlignment();
        renderStickers();

        const coverSrc = data.coverHash
            ? `../cassetteAlbumCovers/${data.coverHash}.jpg`
            : '../images_original/SmallCustomCassetteTemplate.png';
        
        $coverImage.attr('src', coverSrc);
        $visualsCoverImage.attr('src', coverSrc).show();

        // Show/hide the video frame picker
        if (data.isVideo) {
            $videoFramePicker.show();
            $frameTimeInput.val(data.frameTimeSec || 0);
        } else {
            $videoFramePicker.hide();
        }
        
        // Render Palette
        $palettePreview.empty();
        if (data.colors) {
            Object.keys(data.colors).forEach(key => {
                const hex = data.colors[key];
                if (hex) {
                    const $swatch = $(`<div title="${key}" style="width: 30px; height: 30px; border-radius: 50%; cursor: pointer; border: 2px solid #555; background-color: ${hex}"></div>`);
                    $swatch.on('click', () => {
                        $cassetteColor.val(hex);
                        applyPreviewTint();
                        saveVisuals();
                    });
                    $palettePreview.append($swatch);
                }
            });
        }
    };
    
    $('#btn-auto-cassette-color').on('click', () => {
        const data = window.cassetteData.find(c => c.UUID === window.currentCassetteUUID);
        if (data && data.colors && data.colors.DarkVibrant) {
            $cassetteColor.val(data.colors.DarkVibrant);
            applyPreviewTint();
            saveVisuals();
        }
    });

    $('#btn-auto-label-color').on('click', () => {
        const data = window.cassetteData.find(c => c.UUID === window.currentCassetteUUID);
        if (data && data.colors && data.colors.Vibrant) {
            $labelColor.val(data.colors.Vibrant);
            applyPreviewTint();
            saveVisuals();
        }
    });
});
