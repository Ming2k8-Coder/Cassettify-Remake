let cassetteData = [];
let audioList = [];
let activeAudioIndex = -1;


async function updateAudioFiles() {
    cassetteData = await window.metadata.getCassetteData();
    const audioListContainer = document.getElementById("songlist-container");


    document.getElementById("audio-player-button").classList.remove('active');

    for (let i = 0; i < audioList.length; i++) {
        audioList[i].pause();
        audioList[i].currentTime = 0;
    };

    audioListContainer.textContent = '';

    for (let i = 0; i < cassetteData.length; i++) {
        let data = cassetteData[i];
        const audioContainer = document.createElement("div");
        audioContainer.id = "song-container-" + i;
        audioContainer.classList.add("song-container");

        const audio = new Audio(`../cassettes/${data.UUID}/originalAudio/${data.filename}`);
        audioList[i] = audio;

        audioContainer.innerHTML = `
            <figure>
                <div class="image-container" onclick="toggleAudio(${i});">
                    <img src="../cassetteAlbumCovers/${data.coverHash}.jpg" alt="${data.coverHash}"/>
                </div>
                <figcaption>
                    <li>
                        <ul>${data.artist}</ul>
                        <ul>${data.title}</ul>
                    </li>
                </figcaption>
                <div class="song-container-buttons">
                    <button></button>
                    <button onclick="openConfigForCassette(${i})"></button>
                    <button></button>
                </div>
            </figure>
        `;
        audioListContainer.appendChild(audioContainer);

        audioContainer.classList.add('searched');
    };
    console.log(document.getElementById("song-search-input").value,)
    searchAudio(document.getElementById("song-search-input").value);
}



async function selectAudioFiles() {
    const audioPaths = await window.filesystem.openFileDialog();
    if (audioPaths && audioPaths.length > 0) {
        if (typeof showLoadingScreen === 'function') showLoadingScreen();
        // creates an item in the cassettes folder for each file selected in the file dialog
        for (const path of audioPaths) {
            await window.metadata.initializeAudio(path);
        }
        await updateAudioFiles();
        if (typeof hideLoadingScreen === 'function') hideLoadingScreen();
    }
}


async function setAudioState(i) {
    const data = await cassetteData[i]
    const audio = audioList[i];
    const element = document.getElementById("song-container-" + i);
    const audioPlayerButton = document.getElementById("audio-player-button");
    const audioPlayerCover = document.getElementById("audio-player-cover");
    const audioPlayerTitle = document.getElementById("audio-player-title");

    audioPlayerCover.src = `../cassetteAlbumCovers/${(data.coverHash)}.jpg`;
    audioPlayerTitle.innerHTML = `${data.artist} - ${data.title}`;
    
    const cassette3dCover = document.getElementById("cassette-cover-image");
    if (cassette3dCover) {
        cassette3dCover.src = `../cassetteAlbumCovers/${(data.coverHash)}.jpg`;
        cassette3dCover.style.display = 'block';
    }

    for (let j = 0; j < audioList.length; j++) {
        if (j != i && audio.paused) {
            audioList[j].pause();
            audioList[j].currentTime = 0;
            document.getElementById("song-container-" + j).classList.remove('active');
        };
    };

    if (element.classList.contains('active')) {
        audio.play();
    }
    else {
        audio.pause();
    };

    updateSongTime();

    audio.addEventListener('ended', () => {
        element.classList.remove('active');
        audioPlayerButton.classList.remove('active');
    });
}

function searchAudio(searchInput) {
    console.log(searchInput)
    for (let i = 0; i < audioList.length; i++) {
        const element = document.getElementById("song-container-" + i);
        console.log(element)
        const songDetailElements = element.querySelectorAll('figure figcaption li ul');
        for (let j = 0; j < songDetailElements.length; j++) {
            if ((songDetailElements[j].innerHTML.toLowerCase().includes(searchInput.toLowerCase())) || searchInput == '') {
                element.classList.add('searched');
                break;
            }
            else {
                element.classList.remove('searched')
            };
        };
    };
};

function toggleAudio(i, usedAudioPlayer=false) {
    activeAudioIndex = i;
    const songContainerElement = document.getElementById('song-container-' + i);
    const audioPlayerButton = document.getElementById('audio-player-button')
    if (usedAudioPlayer) {
        audioPlayerButton.classList.toggle('active');
        if (audioPlayerButton.classList.contains('active')) {
            songContainerElement.classList.add('active');
        }
        else {
            songContainerElement.classList.remove('active');
        };
    }
    else {
        songContainerElement.classList.toggle('active');
        if (songContainerElement.classList.contains('active')) {
            audioPlayerButton.classList.add('active');
        }
        else {
            audioPlayerButton.classList.remove('active');
        };
    };

    setAudioState(i);
};

function openConfigForCassette(i) {
    const data = cassetteData[i];
    openPage('config');
    
    // We update global state so config.js knows which one is selected
    window.currentCassetteUUID = data.UUID;
    
    const titleInput = document.getElementById('song-title');
    const authorInput = document.getElementById('song-author');
    const coverImage = document.getElementById('cover-image');
    
    if (titleInput) titleInput.value = data.title;
    if (authorInput) authorInput.value = data.artist;
    if (coverImage) coverImage.src = `../cassetteAlbumCovers/${data.coverHash}.jpg`;

    // Smart Palette Extraction (only run if we haven't already extracted colors for this cassette)
    if (!data.colors && window.metadata.extractPalette) {
        window.metadata.extractPalette(data.coverHash).then(result => {
            if (result.success) {
                console.log("Extracted Palette:", result.palette);
                // Save it back to meta.json
                data.colors = result.palette;
                window.metadata.saveCassetteData(data.UUID, { colors: result.palette });
                // We will use these colors in the Visuals page later!
            }
        });
    }
}

setInterval(updateSongTime, 1000);

function updateSongTime() {
    const audio = audioList[activeAudioIndex];
    const audioTime = document.getElementById('audio-player-time');
    const audioProgressBar = document.getElementById('audio-player-progress-level')
    if (audio && !audio.paused) {
        audioTime.innerHTML = `${Math.floor(audio.currentTime / 60)}:${String(Math.floor(audio.currentTime % 60)).padStart(2, '0')} | ${Math.floor(audio.duration / 60)}:${String(Math.floor(audio.duration % 60)).padStart(2, '0')}`;
        audioProgressBar.style.width = (audio.currentTime / audio.duration * 100) + "%";
        audioProgressBar.style.transition = "width 1s linear";
    }
}

updateAudioFiles();

const songSearchInput = document.getElementById("song-search");
songSearchInput.addEventListener('input', (e) => {
    searchAudio(e.target.value);
});

// Drag and Drop Logic
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

if (dropZone && fileInput) {
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', async (e) => {
        handleFiles(e.target.files);
    });
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });
    
    dropZone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
}

async function handleFiles(files) {
    showLoadingScreen();
    const paths = Array.from(files).map(f => f.path).filter(Boolean);
    if (paths.length > 0) {
        for (const path of paths) {
            if (window.metadata && window.metadata.initializeAudio) {
                await window.metadata.initializeAudio(path);
            }
        }
        await updateAudioFiles();
    }
    hideLoadingScreen();
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'flex';
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) loadingScreen.style.display = 'none';
}

// 3D Cassette Viewer Mouse Tracking
document.addEventListener('mousemove', (e) => {
    const model = document.getElementById('cassette-3d-model');
    if (model) {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        model.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    }
});
