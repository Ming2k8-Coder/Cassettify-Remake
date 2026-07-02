$(function() {
    const $cassetteColor = $('#cassette-color');
    const $labelColor = $('#label-color');
    const $patternSelect = $('#pattern-select');
    const $palettePreview = $('#palette-preview');
    const $previewCassette = $('#preview-cassette-template');
    
    // We can simulate a color tint by wrapping the image in a container with a background color and mix-blend-mode
    // Wait, since we can't easily tint an image directly without complex filters, 
    // we'll just apply a CSS drop-shadow trick or pseudo-element overlay for preview purposes.
    // A quick hack for tinting is to use CSS sepia/hue-rotate, but it's hard to target specific hex colors.
    // For now, let's just show the color selection UI and save the data.

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
                LabelColor: hexToNormalizedRGB($labelColor.val())
            },
            hexColors: {
                cassette: $cassetteColor.val(),
                label: $labelColor.val()
            }
        };
        
        await window.metadata.saveCassetteData(window.currentCassetteUUID, updatedData);
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
        // A simple visual indicator in the UI (since CSS tinting of a grayscale PNG is complex)
        $previewCassette.css('border', `5px solid ${$cassetteColor.val()}`);
        $previewCassette.css('background-color', $labelColor.val());
    }

    $cassetteColor.on('input', () => { applyPreviewTint(); saveVisuals(); });
    $labelColor.on('input', () => { applyPreviewTint(); saveVisuals(); });
    $patternSelect.on('change', saveVisuals);

    // This function can be called when switching to the visuals page
    window.loadVisualsPage = function() {
        if (!window.currentCassetteUUID) return;
        const data = window.cassetteData.find(c => c.UUID === window.currentCassetteUUID);
        
        if (data && data.hexColors) {
            $cassetteColor.val(data.hexColors.cassette || '#ffffff');
            $labelColor.val(data.hexColors.label || '#ffffff');
            applyPreviewTint();
        }
        if (data && data.visuals) {
            $patternSelect.val(data.visuals.CassetteTextureInternalName || 'ANNAT3');
        }
        
        // Render Palette
        $palettePreview.empty();
        if (data && data.colors) {
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
